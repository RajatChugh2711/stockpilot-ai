import { Module } from '@nestjs/common';
import { MarketDataProviderRegistry } from './application/market-data-provider.registry';
import { MARKET_DATA_PROVIDERS } from './market-data.constants';
import { MarketDataController } from './presentation/market-data.controller';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataProviderRegistry,
    {
      provide: MARKET_DATA_PROVIDERS,
      useValue: [],
    },
  ],
  exports: [MarketDataProviderRegistry],
})
export class MarketDataModule {}
