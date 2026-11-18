export type InstrumentMasterExchange = 'NSE' | 'BSE';
export type InstrumentMasterType = 'EQUITY' | 'ETF' | 'INDEX';

export interface ParsedInstrumentMasterRow {
  rowNumber: number;
  exchangeCode: InstrumentMasterExchange;
  symbol: string;
  companyName: string;
  isin: string | null;
  securityCode: string | null;
  instrumentType: InstrumentMasterType;
  currency: string;
  rawRow: Record<string, string>;
}

export interface InstrumentMasterParseIssue {
  rowNumber: number;
  errorCode: string;
  message: string;
  rawRow: Record<string, string> | null;
}

export interface InstrumentMasterParseResult {
  rows: ParsedInstrumentMasterRow[];
  issues: InstrumentMasterParseIssue[];
  recordsRead: number;
}

const REQUIRED_HEADERS = [
  'exchange',
  'symbol',
  'company_name',
  'isin',
  'security_code',
  'instrument_type',
  'currency',
] as const;

const EXCHANGES = new Set<InstrumentMasterExchange>(['NSE', 'BSE']);
const INSTRUMENT_TYPES = new Set<InstrumentMasterType>(['EQUITY', 'ETF', 'INDEX']);

export class InstrumentMasterCsvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstrumentMasterCsvError';
  }
}

function readCsvRecords(content: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;
  let quoteClosed = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (inQuotes) {
      if (character === '"') {
        if (content[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          quoteClosed = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (quoteClosed && character !== ',' && character !== '\n' && character !== '\r') {
      if (!/\s/.test(character)) {
        throw new InstrumentMasterCsvError(
          'CSV contains characters after a closing quote',
        );
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) {
        throw new InstrumentMasterCsvError(
          'CSV contains a quote inside an unquoted field',
        );
      }
      inQuotes = true;
      continue;
    }

    if (character === ',') {
      record.push(field);
      field = '';
      quoteClosed = false;
      continue;
    }

    if (character === '\n' || character === '\r') {
      if (character === '\r' && content[index + 1] === '\n') {
        index += 1;
      }
      record.push(field);
      if (record.some((value) => value.trim().length > 0)) {
        records.push(record);
      }
      record = [];
      field = '';
      quoteClosed = false;
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    throw new InstrumentMasterCsvError('CSV contains an unterminated quoted field');
  }

  if (field.length > 0 || record.length > 0 || quoteClosed) {
    record.push(field);
    if (record.some((value) => value.trim().length > 0)) {
      records.push(record);
    }
  }

  return records;
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase();
}

function buildRawRow(headers: string[], values: string[]): Record<string, string> {
  return Object.fromEntries(
    headers.map((header, index) => [header, (values[index] ?? '').trim()]),
  );
}

export function parseInstrumentMasterCsv(
  content: string,
  expectedExchange?: InstrumentMasterExchange,
): InstrumentMasterParseResult {
  if (!content.trim()) {
    throw new InstrumentMasterCsvError('CSV file is empty');
  }

  const records = readCsvRecords(content);
  if (records.length < 2) {
    throw new InstrumentMasterCsvError('CSV must contain a header and at least one data row');
  }

  const headers = records[0].map(normalizeHeader);
  if (new Set(headers).size !== headers.length) {
    throw new InstrumentMasterCsvError('CSV contains duplicate column headers');
  }

  const unsupportedHeaders = headers.filter(
    (header) => !(REQUIRED_HEADERS as readonly string[]).includes(header),
  );
  if (unsupportedHeaders.length > 0) {
    throw new InstrumentMasterCsvError(
      'CSV contains unsupported columns: ' + unsupportedHeaders.join(', '),
    );
  }

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new InstrumentMasterCsvError(
      'CSV is missing required columns: ' + missingHeaders.join(', '),
    );
  }

  const rows: ParsedInstrumentMasterRow[] = [];
  const issues: InstrumentMasterParseIssue[] = [];
  const seenListings = new Set<string>();
  const seenExchangeIsins = new Map<string, string>();
  let recordsRead = 0;

  for (let index = 1; index < records.length; index += 1) {
    const values = records[index];
    const rowNumber = index + 1;
    recordsRead += 1;

    if (values.length !== headers.length) {
      issues.push({
        rowNumber,
        errorCode: 'COLUMN_COUNT_MISMATCH',
        message: 'Row has ' + values.length + ' columns; expected ' + headers.length,
        rawRow: buildRawRow(headers, values),
      });
      continue;
    }

    const rawRow = buildRawRow(headers, values);
    const value = (header: (typeof REQUIRED_HEADERS)[number]) =>
      rawRow[header] ?? '';

    const exchangeCode = value('exchange').toUpperCase();
    const symbol = value('symbol').toUpperCase();
    const companyName = value('company_name');
    const isinValue = value('isin').toUpperCase();
    const securityCodeValue = value('security_code');
    const instrumentType = value('instrument_type').toUpperCase();
    const currencyValue = value('currency').toUpperCase() || 'INR';

    let error: { code: string; message: string } | null = null;

    if (!EXCHANGES.has(exchangeCode as InstrumentMasterExchange)) {
      error = { code: 'INVALID_EXCHANGE', message: 'exchange must be NSE or BSE' };
    } else if (expectedExchange && exchangeCode !== expectedExchange) {
      error = {
        code: 'EXCHANGE_MISMATCH',
        message: 'Row exchange does not match the import exchange',
      };
    } else if (!/^[A-Z0-9][A-Z0-9&._-]{0,49}$/.test(symbol)) {
      error = { code: 'INVALID_SYMBOL', message: 'symbol is missing or has an invalid format' };
    } else if (!companyName || companyName.length > 255) {
      error = {
        code: 'INVALID_COMPANY_NAME',
        message: 'company_name must contain 1 to 255 characters',
      };
    } else if (isinValue && !/^IN[A-Z0-9]{10}$/.test(isinValue)) {
      error = { code: 'INVALID_ISIN', message: 'isin must be a 12-character Indian ISIN or empty' };
    } else if (securityCodeValue.length > 30) {
      error = {
        code: 'INVALID_SECURITY_CODE',
        message: 'security_code cannot exceed 30 characters',
      };
    } else if (!INSTRUMENT_TYPES.has(instrumentType as InstrumentMasterType)) {
      error = {
        code: 'INVALID_INSTRUMENT_TYPE',
        message: 'instrument_type must be EQUITY, ETF or INDEX',
      };
    } else if (!/^[A-Z]{3}$/.test(currencyValue)) {
      error = { code: 'INVALID_CURRENCY', message: 'currency must be a 3-letter code' };
    }

    if (error) {
      issues.push({
        rowNumber,
        errorCode: error.code,
        message: error.message,
        rawRow,
      });
      continue;
    }

    const listingKey = exchangeCode + ':' + symbol;
    if (seenListings.has(listingKey)) {
      issues.push({
        rowNumber,
        errorCode: 'DUPLICATE_LISTING_IN_FILE',
        message: 'The same exchange and symbol appear more than once in this file',
        rawRow,
      });
      continue;
    }

    if (isinValue) {
      const exchangeIsinKey = exchangeCode + ':' + isinValue;
      const previousSymbol = seenExchangeIsins.get(exchangeIsinKey);
      if (previousSymbol && previousSymbol !== symbol) {
        issues.push({
          rowNumber,
          errorCode: 'DUPLICATE_ISIN_ON_EXCHANGE',
          message: 'The same ISIN is assigned to multiple symbols on one exchange in this file',
          rawRow,
        });
        continue;
      }
      seenExchangeIsins.set(exchangeIsinKey, symbol);
    }

    seenListings.add(listingKey);
    rows.push({
      rowNumber,
      exchangeCode: exchangeCode as InstrumentMasterExchange,
      symbol,
      companyName,
      isin: isinValue || null,
      securityCode: securityCodeValue || null,
      instrumentType: instrumentType as InstrumentMasterType,
      currency: currencyValue,
      rawRow,
    });
  }

  return { rows, issues, recordsRead };
}
