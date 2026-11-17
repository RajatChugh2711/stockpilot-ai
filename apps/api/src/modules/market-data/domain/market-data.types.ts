export type ExchangeCode = 'NSE' | 'BSE';

export type MarketInstrumentType = 'EQUITY' | 'ETF' | 'INDEX';

export type QuoteMode = 'REAL_TIME' | 'DELAYED' | 'END_OF_DAY' | 'NONE';

export interface MarketDataProviderCapabilities {
  exchanges: ExchangeCode[];
  instrumentTypes: MarketInstrumentType[];
  intervals: ['1d'];
  quoteMode: QuoteMode;
  supportsCorporateActions: boolean;
  dailyHistoryStartDate: string | null;
}

export interface InstrumentSearchRequest {
  query: string;
  exchange?: ExchangeCode;
  limit: number;
}

export interface ProviderInstrument {
  providerInstrumentId: string;
  exchange: ExchangeCode;
  symbol: string;
  name: string;
  isin: string | null;
  currency: string;
  instrumentType: MarketInstrumentType;
}

export interface DailyBar {
  tradingDate: string;
  open: string | null;
  high: string | null;
  low: string | null;
  close: string;
  volume: string | null;
  sourceAsOf: string | null;
}

export interface DailyHistoryRequest {
  providerInstrumentId: string;
  fromDate: string;
  toDate: string;
}

export interface LatestQuoteRequest {
  providerInstrumentId: string;
}

export interface LatestQuote {
  price: string;
  priceType: 'LAST_TRADED' | 'OFFICIAL_CLOSE';
  quoteMode: Exclude<QuoteMode, 'NONE'>;
  asOf: string;
  currency: string;
}

export interface CorporateAction {
  type: 'SPLIT' | 'BONUS' | 'DIVIDEND' | 'RIGHTS' | 'OTHER';
  exDate: string;
  ratioOrFactor: string | null;
  cashAmount: string | null;
  currency: string;
}

export interface CorporateActionsRequest {
  providerInstrumentId: string;
  fromDate: string;
  toDate: string;
}

export interface ProviderCapabilitySummary {
  code: string;
  capabilities: MarketDataProviderCapabilities;
}
