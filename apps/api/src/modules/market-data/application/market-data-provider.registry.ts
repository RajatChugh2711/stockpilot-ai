import { Inject, Injectable } from '@nestjs/common';
import { MARKET_DATA_PROVIDERS } from '../market-data.constants';
import type { MarketDataProvider } from '../domain/market-data-provider.interface';
import type { ProviderCapabilitySummary } from '../domain/market-data.types';

@Injectable()
export class MarketDataProviderRegistry {
  constructor(
    @Inject(MARKET_DATA_PROVIDERS)
    private readonly providers: MarketDataProvider[],
  ) {
    const codes = this.providers.map((provider) => provider.code);
    if (new Set(codes).size !== codes.length) {
      throw new Error('Market-data provider codes must be unique');
    }
  }

  listCapabilities(): ProviderCapabilitySummary[] {
    return this.providers.map((provider) => ({
      code: provider.code,
      capabilities: provider.getCapabilities(),
    }));
  }

  getByCode(code: string): MarketDataProvider | undefined {
    return this.providers.find((provider) => provider.code === code);
  }
}
