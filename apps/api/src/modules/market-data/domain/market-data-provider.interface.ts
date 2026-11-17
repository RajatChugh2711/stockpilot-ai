import type {
  CorporateAction,
  CorporateActionsRequest,
  DailyBar,
  DailyHistoryRequest,
  InstrumentSearchRequest,
  LatestQuote,
  LatestQuoteRequest,
  MarketDataProviderCapabilities,
  ProviderInstrument,
} from './market-data.types';

export interface MarketDataProvider {
  readonly code: string;

  getCapabilities(): MarketDataProviderCapabilities;

  searchInstruments(request: InstrumentSearchRequest): Promise<ProviderInstrument[]>;

  getDailyHistory(request: DailyHistoryRequest): Promise<DailyBar[]>;

  getLatestQuote(request: LatestQuoteRequest): Promise<LatestQuote | null>;

  getCorporateActions(request: CorporateActionsRequest): Promise<CorporateAction[]>;
}
