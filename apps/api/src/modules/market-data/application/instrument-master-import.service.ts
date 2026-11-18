import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import {
  InstrumentMasterCsvError,
  parseInstrumentMasterCsv,
  type InstrumentMasterExchange,
  type InstrumentMasterParseIssue,
  type InstrumentMasterParseResult,
  type ParsedInstrumentMasterRow,
} from './instrument-master-csv.parser';
import { MARKET_DATA_DB_POOL } from '../market-data.constants';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_RECORDS = 50_000;

interface ImportIssue {
  rowNumber: number;
  errorCode: string;
  message: string;
  rawRow: Record<string, string> | null;
}

export interface ImportInstrumentMasterInput {
  csvContent: string;
  sourceName: string;
  sourceFileName: string;
  sourceReference?: string;
  exchangeCode?: InstrumentMasterExchange;
  dryRun?: boolean;
}

export interface InstrumentMasterImportResult {
  runId: string;
  status: 'DRY_RUN' | 'SUCCEEDED' | 'PARTIAL' | 'FAILED';
  dryRun: boolean;
  recordsRead: number;
  recordsValid: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsRejected: number;
  issues: ImportIssue[];
}

interface ExistingInstrument {
  id: string;
  company_id: string;
  isin: string | null;
}

interface CompanyLookup {
  company_id: string;
}

@Injectable()
export class InstrumentMasterImportService implements OnModuleDestroy {
  constructor(
    @Inject(MARKET_DATA_DB_POOL)
    private readonly pool: Pool,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async importCsv(
    input: ImportInstrumentMasterInput,
  ): Promise<InstrumentMasterImportResult> {
    this.validateMetadata(input);

    const dryRun = input.dryRun ?? true;
    const fileSha256 = createHash('sha256').update(input.csvContent, 'utf8').digest('hex');
    const runId = randomUUID();

    await this.pool.query(
      `INSERT INTO instrument_import_runs (
        id, exchange_code, source_name, source_file_name, source_reference,
        file_sha256, status, dry_run, started_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'DRY_RUN'::"InstrumentImportStatus", $7, NOW())`,
      [
        runId,
        input.exchangeCode ?? null,
        input.sourceName.trim(),
        input.sourceFileName.trim(),
        input.sourceReference?.trim() || null,
        fileSha256,
        dryRun,
      ],
    );

    let parsed: InstrumentMasterParseResult;
    try {
      parsed = parseInstrumentMasterCsv(input.csvContent, input.exchangeCode);
      if (parsed.recordsRead > MAX_RECORDS) {
        throw new InstrumentMasterCsvError(
          'CSV exceeds the maximum of ' + MAX_RECORDS + ' data records',
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to parse instrument master CSV';
      await this.finishFailedRun(runId, message);
      throw new BadRequestException(message);
    }

    const issues: ImportIssue[] = parsed.issues.map((issue) => this.toImportIssue(issue));
    let recordsInserted = 0;
    let recordsUpdated = 0;
    let recordsValid = 0;
    const client = await this.pool.connect();

    try {
      await client.query(
        dryRun ? 'BEGIN READ ONLY' : 'BEGIN ISOLATION LEVEL SERIALIZABLE',
      );

      const exchangeIds = new Map<string, string>();
      const companyByIsin = new Map<string, string | null>();

      for (const row of parsed.rows) {
        const exchangeId = await this.getExchangeId(
          client,
          row.exchangeCode,
          dryRun,
          exchangeIds,
        );

        if (row.isin) {
          const mappedCompanyId = await this.getCompanyIdByIsin(
            client,
            row.isin,
            companyByIsin,
          );

          if (mappedCompanyId === null) {
            issues.push(
              this.issueForRow(
                row,
                'ISIN_COMPANY_AMBIGUOUS',
                'This ISIN is already associated with multiple companies; manual review is required',
              ),
            );
            continue;
          }

          const conflictingListing = await client.query<{ symbol: string }>(
            `SELECT symbol
             FROM instruments
             WHERE exchange_id = $1 AND isin = $2 AND symbol <> $3
             LIMIT 1`,
            [exchangeId, row.isin, row.symbol],
          );

          if (conflictingListing.rowCount) {
            issues.push(
              this.issueForRow(
                row,
                'ISIN_ALREADY_LISTED_ON_EXCHANGE',
                'This ISIN is already mapped to a different symbol on the same exchange',
              ),
            );
            continue;
          }
        }

        const existingResult = await client.query<ExistingInstrument>(
          `SELECT id, company_id, isin
           FROM instruments
           WHERE exchange_id = $1 AND symbol = $2
           LIMIT 1\${dryRun ? '' : ' FOR UPDATE'}`,
          [exchangeId, row.symbol],
        );
        const existing = existingResult.rows[0];

        if (
          existing &&
          row.isin &&
          existing.isin &&
          existing.isin !== row.isin
        ) {
          issues.push(
            this.issueForRow(
              row,
              'SYMBOL_ISIN_CONFLICT',
              'The exchange symbol already exists with a different ISIN',
            ),
          );
          continue;
        }

        const mappedCompanyId = row.isin
          ? (companyByIsin.get(row.isin) ?? null)
          : null;

        if (existing && mappedCompanyId && existing.company_id !== mappedCompanyId) {
          issues.push(
            this.issueForRow(
              row,
              'LISTING_COMPANY_CONFLICT',
              'The existing exchange symbol belongs to a different company than the ISIN mapping',
            ),
          );
          continue;
        }

        if (existing) {
          if (!dryRun) {
            await client.query(
              `UPDATE instruments
               SET isin = COALESCE(isin, $2),
                   security_code = COALESCE($3, security_code),
                   instrument_type = $4::"InstrumentType",
                   currency = $5,
                   active = TRUE,
                   updated_at = NOW()
               WHERE id = $1
                 AND (
                   (isin IS NULL AND $2 IS NOT NULL)
                   OR security_code IS DISTINCT FROM COALESCE($3, security_code)
                   OR instrument_type IS DISTINCT FROM $4::"InstrumentType"
                   OR currency IS DISTINCT FROM $5
                   OR active IS DISTINCT FROM TRUE
                 )`,
              [
                existing.id,
                row.isin,
                row.securityCode,
                row.instrumentType,
                row.currency,
              ],
            );
          }

          if (row.isin) {
            companyByIsin.set(row.isin, existing.company_id);
          }
          recordsUpdated += 1;
          recordsValid += 1;
          continue;
        }

        let companyId = mappedCompanyId;
        if (!companyId) {
          companyId = randomUUID();
          if (!dryRun) {
            await client.query(
              `INSERT INTO companies (id, name, created_at, updated_at)
               VALUES ($1, $2, NOW(), NOW())`,
              [companyId, row.companyName],
            );
          }
        }

        if (row.isin) {
          companyByIsin.set(row.isin, companyId);
        }

        if (!dryRun) {
          await client.query(
            `INSERT INTO instruments (
              id, company_id, exchange_id, symbol, isin, security_code,
              instrument_type, currency, active, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7::"InstrumentType", $8, TRUE, NOW(), NOW()
            )`,
            [
              randomUUID(),
              companyId,
              exchangeId,
              row.symbol,
              row.isin,
              row.securityCode,
              row.instrumentType,
              row.currency,
            ],
          );
        }

        recordsInserted += 1;
        recordsValid += 1;
      }

      const recordsRejected = issues.length;
      const status = dryRun
        ? 'DRY_RUN'
        : recordsRejected === 0
          ? 'SUCCEEDED'
          : recordsValid > 0
            ? 'PARTIAL'
            : 'FAILED';

      if (dryRun) {
        await client.query('ROLLBACK');
        await this.persistAuditResult(this.pool, runId, {
          status,
          recordsRead: parsed.recordsRead,
          recordsValid,
          recordsInserted,
          recordsUpdated,
          recordsRejected,
          issues,
        });
      } else {
        await this.persistIssues(client, runId, issues);
        await client.query(
          `UPDATE instrument_import_runs
           SET status = $2::"InstrumentImportStatus",
               records_read = $3,
               records_valid = $4,
               records_inserted = $5,
               records_updated = $6,
               records_rejected = $7,
               finished_at = NOW()
           WHERE id = $1`,
          [
            runId,
            status,
            parsed.recordsRead,
            recordsValid,
            recordsInserted,
            recordsUpdated,
            recordsRejected,
          ],
        );
        await client.query('COMMIT');
      }

      return {
        runId,
        status,
        dryRun,
        recordsRead: parsed.recordsRead,
        recordsValid,
        recordsInserted,
        recordsUpdated,
        recordsRejected,
        issues,
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      const message =
        error instanceof Error ? error.message : 'Instrument master import failed';
      await this.finishFailedRun(runId, message);
      throw new InternalServerErrorException(
        'Instrument master import failed. The import run was marked as failed.',
      );
    } finally {
      client.release();
    }
  }

  private validateMetadata(input: ImportInstrumentMasterInput): void {
    if (!input.csvContent || Buffer.byteLength(input.csvContent, 'utf8') > MAX_FILE_BYTES) {
      throw new BadRequestException('CSV content is required and must not exceed 10 MB');
    }
    if (!input.sourceName?.trim() || input.sourceName.trim().length > 150) {
      throw new BadRequestException('sourceName must contain 1 to 150 characters');
    }
    if (!input.sourceFileName?.trim() || input.sourceFileName.trim().length > 255) {
      throw new BadRequestException('sourceFileName must contain 1 to 255 characters');
    }
    if (input.sourceReference && input.sourceReference.length > 2_000) {
      throw new BadRequestException('sourceReference cannot exceed 2,000 characters');
    }
  }

  private async getExchangeId(
    client: PoolClient,
    exchangeCode: InstrumentMasterExchange,
    dryRun: boolean,
    cache: Map<string, string>,
  ): Promise<string> {
    const cached = cache.get(exchangeCode);
    if (cached) {
      return cached;
    }

    const exchangeName =
      exchangeCode === 'NSE' ? 'National Stock Exchange of India' : 'BSE Ltd';
    let exchangeId: string;

    if (dryRun) {
      const result = await client.query<{ id: string }>(
        'SELECT id FROM exchanges WHERE code = $1',
        [exchangeCode],
      );
      exchangeId = result.rows[0]?.id ?? randomUUID();
    } else {
      const result = await client.query<{ id: string }>(
        `INSERT INTO exchanges (id, code, name, country_code, created_at)
         VALUES ($1, $2, $3, 'IN', NOW())
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [randomUUID(), exchangeCode, exchangeName],
      );
      exchangeId = result.rows[0].id;
    }

    cache.set(exchangeCode, exchangeId);
    return exchangeId;
  }

  private async getCompanyIdByIsin(
    client: PoolClient,
    isin: string,
    cache: Map<string, string | null>,
  ): Promise<string | null | undefined> {
    if (cache.has(isin)) {
      return cache.get(isin);
    }

    const result = await client.query<CompanyLookup>(
      'SELECT DISTINCT company_id FROM instruments WHERE isin = $1',
      [isin],
    );
    if (result.rows.length > 1) {
      cache.set(isin, null);
      return null;
    }

    const companyId = result.rows[0]?.company_id;
    if (companyId) {
      cache.set(isin, companyId);
    }
    return companyId;
  }

  private issueForRow(
    row: ParsedInstrumentMasterRow,
    errorCode: string,
    message: string,
  ): ImportIssue {
    return {
      rowNumber: row.rowNumber,
      errorCode,
      message,
      rawRow: row.rawRow,
    };
  }

  private toImportIssue(issue: InstrumentMasterParseIssue): ImportIssue {
    return {
      rowNumber: issue.rowNumber,
      errorCode: issue.errorCode,
      message: issue.message,
      rawRow: issue.rawRow,
    };
  }

  private async persistIssues(
    client: Pool | PoolClient,
    runId: string,
    issues: ImportIssue[],
  ): Promise<void> {
    for (const issue of issues) {
      await client.query(
        `INSERT INTO instrument_import_issues (
          id, import_run_id, row_number, error_code, message, raw_row, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())`,
        [
          randomUUID(),
          runId,
          issue.rowNumber,
          issue.errorCode,
          issue.message,
          issue.rawRow ? JSON.stringify(issue.rawRow) : null,
        ],
      );
    }
  }

  private async persistAuditResult(
    client: Pool,
    runId: string,
    result: {
      status: string;
      recordsRead: number;
      recordsValid: number;
      recordsInserted: number;
      recordsUpdated: number;
      recordsRejected: number;
      issues: ImportIssue[];
    },
  ): Promise<void> {
    await this.persistIssues(client, runId, result.issues);
    await client.query(
      `UPDATE instrument_import_runs
       SET status = $2::"InstrumentImportStatus",
           records_read = $3,
           records_valid = $4,
           records_inserted = $5,
           records_updated = $6,
           records_rejected = $7,
           finished_at = NOW()
       WHERE id = $1`,
      [
        runId,
        result.status,
        result.recordsRead,
        result.recordsValid,
        result.recordsInserted,
        result.recordsUpdated,
        result.recordsRejected,
      ],
    );
  }

  private async finishFailedRun(runId: string, message: string): Promise<void> {
    await this.pool.query(
      `UPDATE instrument_import_runs
       SET status = 'FAILED'::"InstrumentImportStatus",
           error_message = $2,
           finished_at = NOW()
       WHERE id = $1`,
      [runId, message.slice(0, 2_000)],
    );
  }
}
