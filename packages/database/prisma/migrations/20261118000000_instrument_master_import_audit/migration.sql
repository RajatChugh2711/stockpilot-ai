-- Move ISIN from issuer-level Company to exchange/security-level Instrument.
-- Preserve existing values for all current listings before dropping the old column.
ALTER TABLE "instruments" ADD COLUMN "isin" VARCHAR(12);
UPDATE "instruments" AS instrument
SET "isin" = company."isin"
FROM "companies" AS company
WHERE instrument."company_id" = company."id"
  AND company."isin" IS NOT NULL;
DROP INDEX "companies_isin_key";
ALTER TABLE "companies" DROP COLUMN "isin";
CREATE INDEX "instruments_isin_idx" ON "instruments"("isin");

CREATE TYPE "InstrumentImportStatus" AS ENUM ('DRY_RUN', 'SUCCEEDED', 'PARTIAL', 'FAILED');

CREATE TABLE "instrument_import_runs" (
  "id" UUID NOT NULL,
  "exchange_code" VARCHAR(10),
  "source_name" VARCHAR(150) NOT NULL,
  "source_file_name" VARCHAR(255) NOT NULL,
  "source_reference" TEXT,
  "file_sha256" CHAR(64) NOT NULL,
  "status" "InstrumentImportStatus" NOT NULL DEFAULT 'DRY_RUN',
  "dry_run" BOOLEAN NOT NULL DEFAULT true,
  "records_read" INTEGER NOT NULL DEFAULT 0,
  "records_valid" INTEGER NOT NULL DEFAULT 0,
  "records_inserted" INTEGER NOT NULL DEFAULT 0,
  "records_updated" INTEGER NOT NULL DEFAULT 0,
  "records_rejected" INTEGER NOT NULL DEFAULT 0,
  "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" TIMESTAMPTZ(6),
  "error_message" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "instrument_import_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "instrument_import_issues" (
  "id" UUID NOT NULL,
  "import_run_id" UUID NOT NULL,
  "row_number" INTEGER NOT NULL,
  "error_code" VARCHAR(80) NOT NULL,
  "message" TEXT NOT NULL,
  "raw_row" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "instrument_import_issues_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "instrument_import_runs_created_at_idx"
  ON "instrument_import_runs"("created_at" DESC);
CREATE INDEX "instrument_import_runs_exchange_code_created_at_idx"
  ON "instrument_import_runs"("exchange_code", "created_at" DESC);
CREATE INDEX "instrument_import_issues_import_run_id_row_number_idx"
  ON "instrument_import_issues"("import_run_id", "row_number");

ALTER TABLE "instrument_import_issues"
  ADD CONSTRAINT "instrument_import_issues_import_run_id_fkey"
  FOREIGN KEY ("import_run_id") REFERENCES "instrument_import_runs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
