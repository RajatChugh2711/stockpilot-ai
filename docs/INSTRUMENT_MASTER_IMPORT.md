# Instrument Master CSV Import

## Status

The first importer implementation is an internal NestJS application service. There is deliberately no HTTP import route until authentication and admin authorization are implemented.

The importer uses the existing PostgreSQL instrument_import_runs and instrument_import_issues audit tables. It does not call an exchange or market-data provider.

## CSV contract

The header must contain these exact columns. Column order may vary.

\`\`\`csv
exchange,symbol,company_name,isin,security_code,instrument_type,currency
NSE,SYNALPHA,"Synthetic Alpha, Ltd",INZZZZZZZZZ1,900001,EQUITY,INR
BSE,900001,"Synthetic Alpha, Ltd",INZZZZZZZ1,900001,EQUITY,INR
\`\`\`

The example above is fabricated test data. It is not an exchange record and must never be used as production market data.

exchange accepts NSE or BSE. instrument_type accepts EQUITY, ETF or INDEX. isin and security_code may be empty. Empty currency defaults to INR. Indian ISIN values must have 12 characters and start with IN.

CSV supports quoted values, commas inside quoted values, escaped double quotes, UTF-8 BOM and CRLF/LF line endings. Unknown columns and malformed CSV structure fail the file. Invalid individual rows are rejected and written to the import issue log.

## Identity rules

- Company is the issuer; Instrument is an exchange listing.
- Existing listings are matched by the exchange and symbol pair.
- Cross-exchange issuer mapping uses ISIN only.
- Company names are never used for fuzzy matching or automatic merging.
- If an ISIN maps to multiple companies, the row is rejected for manual review.
- If a symbol already has a different ISIN, or the ISIN conflicts with the existing issuer mapping, the row is rejected.
- A row without ISIN can update an exact existing exchange-symbol listing. A new no-ISIN listing gets its own Company record because there is no safe cross-listing identity key.

The importer does not overwrite an existing company name from a new file. It can fill a previously missing ISIN and update listing metadata.

## Execution behavior

InstrumentMasterImportService.importCsv() accepts CSV text and source metadata. dryRun defaults to true.

Dry run uses a read-only database transaction. It validates rows against current listings, reports projected insert/update counts and writes only the import audit run and issue rows. It does not create exchanges, companies or instruments.

A real import runs in a serializable transaction. Accepted rows and the final audit counters are committed together. A database failure rolls back instrument changes and marks the import run as failed.

Limits: 10 MB per CSV and 50,000 data records. The SHA-256 hash of the exact UTF-8 CSV content is stored for traceability.

recordsInserted and recordsUpdated are projected counts during dry run. Existing matched listings count as updates even when the row is already identical; this keeps the result focused on insert-vs-existing classification rather than physical row writes.

## Safety gate

Use only synthetic fixtures until commercial rights for the source data are confirmed. Do not import scraped exchange data or redistribute exchange/provider reference data without the required permission.

Do not expose this service through a public or admin HTTP endpoint until authentication and explicit admin authorization are in place.
