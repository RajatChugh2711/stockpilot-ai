import type { DailyBar } from './market-data.types';

const PRICE_SCALE = 10_000n;
const DECIMAL_PATTERN = /^(0|[1-9]\d*)(?:\.(\d{1,4}))?$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export class InvalidMarketDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMarketDataError';
  }
}

function toScaledPrice(value: string, field: string): bigint {
  const match = DECIMAL_PATTERN.exec(value);

  if (!match) {
    throw new InvalidMarketDataError(
      'Invalid ' + field + ': expected a positive decimal with up to 4 places',
    );
  }

  const whole = BigInt(match[1]);
  const fractional = BigInt((match[2] ?? '').padEnd(4, '0') || '0');
  const scaled = whole * PRICE_SCALE + fractional;

  if (scaled <= 0n) {
    throw new InvalidMarketDataError(field + ' must be greater than zero');
  }

  return scaled;
}

function assertIsoTradingDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InvalidMarketDataError('tradingDate must use YYYY-MM-DD');
  }

  const parsed = new Date(value + 'T00:00:00.000Z');
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new InvalidMarketDataError('tradingDate is not a valid calendar date');
  }
}

function assertOptionalTimestamp(value: string | null): void {
  if (
    value !== null &&
    (!ISO_TIMESTAMP_PATTERN.test(value) || Number.isNaN(Date.parse(value)))
  ) {
    throw new InvalidMarketDataError('sourceAsOf must be an ISO timestamp with a timezone');
  }
}

export function validateDailyBar(bar: DailyBar): DailyBar {
  assertIsoTradingDate(bar.tradingDate);
  assertOptionalTimestamp(bar.sourceAsOf);

  const close = toScaledPrice(bar.close, 'close');
  const open = bar.open === null ? null : toScaledPrice(bar.open, 'open');
  const high = bar.high === null ? null : toScaledPrice(bar.high, 'high');
  const low = bar.low === null ? null : toScaledPrice(bar.low, 'low');

  if (bar.volume !== null && !/^\d+$/.test(bar.volume)) {
    throw new InvalidMarketDataError('volume must be a non-negative integer string');
  }

  if (high !== null && high < close) {
    throw new InvalidMarketDataError('high cannot be lower than close');
  }
  if (low !== null && low > close) {
    throw new InvalidMarketDataError('low cannot be higher than close');
  }
  if (open !== null && high !== null && high < open) {
    throw new InvalidMarketDataError('high cannot be lower than open');
  }
  if (open !== null && low !== null && low > open) {
    throw new InvalidMarketDataError('low cannot be higher than open');
  }
  if (low !== null && high !== null && low > high) {
    throw new InvalidMarketDataError('low cannot be higher than high');
  }

  return bar;
}
