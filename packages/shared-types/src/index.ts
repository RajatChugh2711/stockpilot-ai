export type ExchangeCode = 'NSE' | 'BSE';

export type DataFreshness = {
  asOf: string;
  provider: string;
  delayed: boolean;
};

export type ServiceHealth = {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  timestamp: string;
};
