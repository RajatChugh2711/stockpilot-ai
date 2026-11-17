const assert = require('node:assert/strict');
const test = require('node:test');

const {
  InvalidMarketDataError,
  validateDailyBar,
} = require('../dist/modules/market-data/domain/market-data-bar.validator.js');

function createValidBar(overrides = {}) {
  return {
    tradingDate: '2026-11-17',
    open: '100.125',
    high: '105.125',
    low: '98.75',
    close: '104.75',
    volume: '123456',
    sourceAsOf: '2026-11-17T10:00:00+05:30',
    ...overrides,
  };
}

test('accepts a valid daily OHLCV bar without converting decimal strings to floating point', () => {
  const bar = createValidBar();
  assert.deepEqual(validateDailyBar(bar), bar);
});

test('rejects a high that is below the close', () => {
  assert.throws(
    () => validateDailyBar(createValidBar({ high: '104.5' })),
    InvalidMarketDataError,
  );
});

test('rejects an impossible calendar trading date', () => {
  assert.throws(
    () => validateDailyBar(createValidBar({ tradingDate: '2026-02-30' })),
    InvalidMarketDataError,
  );
});

test('rejects source timestamps without an explicit timezone', () => {
  assert.throws(
    () => validateDailyBar(createValidBar({ sourceAsOf: '2026-11-17T10:00:00' })),
    InvalidMarketDataError,
  );
});

test('rejects negative or fractional volume', () => {
  assert.throws(
    () => validateDailyBar(createValidBar({ volume: '-1' })),
    InvalidMarketDataError,
  );
  assert.throws(
    () => validateDailyBar(createValidBar({ volume: '10.5' })),
    InvalidMarketDataError,
  );
});

test('rejects prices with more than four decimal places', () => {
  assert.throws(
    () => validateDailyBar(createValidBar({ close: '104.75001' })),
    InvalidMarketDataError,
  );
});
