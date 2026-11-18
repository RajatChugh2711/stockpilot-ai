const assert = require('node:assert/strict');
const test = require('node:test');

const {
  InstrumentMasterCsvError,
  parseInstrumentMasterCsv,
} = require('../dist/modules/market-data/application/instrument-master-csv.parser.js');

const header =
  'exchange,symbol,company_name,isin,security_code,instrument_type,currency';

test('parses valid NSE and BSE listings and supports quoted commas', () => {
  const csv = [
    header,
    'NSE,SYNALPHA,"Synthetic Alpha, Ltd",INZZZZZZZZZ1,900001,EQUITY,INR',
    'BSE,900001,"Synthetic Alpha, Ltd",INZZZZZZZZZ1,900001,EQUITY,INR',
  ].join('\r\n');

  const result = parseInstrumentMasterCsv(csv);

  assert.equal(result.recordsRead, 2);
  assert.equal(result.rows.length, 2);
  assert.equal(result.issues.length, 0);
  assert.equal(result.rows[0].companyName, 'Synthetic Alpha, Ltd');
  assert.equal(result.rows[1].isin, 'INZZZZZZZZZ1');
});

test('accepts a UTF-8 BOM and defaults an empty currency to INR', () => {
  const csv = [
    '\uFEFF' + header,
    'NSE,SYNBETA,Synthetic Beta Ltd,,900002,ETF,',
  ].join('\n');

  const result = parseInstrumentMasterCsv(csv);

  assert.equal(result.rows[0].currency, 'INR');
  assert.equal(result.rows[0].isin, null);
});

test('rejects duplicate exchange-symbol listings within one file', () => {
  const csv = [
    header,
    'NSE,SYNALPHA,Synthetic Alpha Ltd,INZZZZZZZZZ1,900001,EQUITY,INR',
    'NSE,SYNALPHA,Synthetic Alpha Ltd,INZZZZZZZZZ1,900001,EQUITY,INR',
  ].join('\n');

  const result = parseInstrumentMasterCsv(csv);

  assert.equal(result.rows.length, 1);
  assert.equal(result.issues[0].errorCode, 'DUPLICATE_LISTING_IN_FILE');
});

test('rejects the same ISIN assigned to different symbols on one exchange', () => {
  const csv = [
    header,
    'NSE,SYNALPHA,Synthetic Alpha Ltd,INZZZZZZZZZ1,900001,EQUITY,INR',
    'NSE,SYNALPHA2,Synthetic Alpha Ltd,INZZZZZZZZZ1,900003,EQUITY,INR',
  ].join('\n');

  const result = parseInstrumentMasterCsv(csv);

  assert.equal(result.rows.length, 1);
  assert.equal(result.issues[0].errorCode, 'DUPLICATE_ISIN_ON_EXCHANGE');
});

test('rejects malformed ISIN values as row-level issues', () => {
  const csv = [
    header,
    'NSE,SYNALPHA,Synthetic Alpha Ltd,NOT-AN-ISIN,900001,EQUITY,INR',
  ].join('\n');

  const result = parseInstrumentMasterCsv(csv);

  assert.equal(result.rows.length, 0);
  assert.equal(result.issues[0].errorCode, 'INVALID_ISIN');
});

test('rejects a row when it does not match the requested exchange', () => {
  const csv = [
    header,
    'BSE,900001,Synthetic Alpha Ltd,INZZZZZZZZZ1,900001,EQUITY,INR',
  ].join('\n');

  const result = parseInstrumentMasterCsv(csv, 'NSE');

  assert.equal(result.rows.length, 0);
  assert.equal(result.issues[0].errorCode, 'EXCHANGE_MISMATCH');
});

test('rejects malformed CSV quoting and unsupported columns', () => {
  assert.throws(
    () => parseInstrumentMasterCsv([header, 'NSE,SYNALPHA,"Broken name'].join('\n')),
    InstrumentMasterCsvError,
  );

  assert.throws(
    () =>
      parseInstrumentMasterCsv(
        [header + ',unexpected_column', 'NSE,SYNALPHA,Synthetic Alpha Ltd,,,,INR,x'].join('\n'),
      ),
    InstrumentMasterCsvError,
  );
});
