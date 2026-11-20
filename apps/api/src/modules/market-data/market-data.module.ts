import { Module } from '@nestjs/common';
import { MarketDataProviderRegistry } from './application/market-data-provider.registry';
import { InstrumentMasterImportService } from './application/instrument-master-import.service';
import { MarketDataDatabasePool } from './market-data-database-pool';
import { MARKET_DATA_DB_POOL, MARKET_DATA_PROVIDERS } from './market-data.constants';
import { MarketDataController } from './presentation/market-data.controller';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataProviderRegistry,
    InstrumentMasterImportService,
    MarketDataDatabasePool,
    {
      provide: MARKET_DATA_DB_POOL,
      useExisting: MarketDataDatabasePool,
    },
    {
      provide: MARKET_DATA_PROVIDERS,
      useValue: [],
    },
  ],
  exports: [MarketDataProviderRegistry, InstrumentMasterImportService],
})
export class MarketDataModule {}
