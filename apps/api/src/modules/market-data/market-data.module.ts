import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { MarketDataProviderRegistry } from './application/market-data-provider.registry';
import { InstrumentMasterImportService } from './application/instrument-master-import.service';
import { MARKET_DATA_DB_POOL, MARKET_DATA_PROVIDERS } from './market-data.constants';
import { MarketDataController } from './presentation/market-data.controller';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataProviderRegistry,
    InstrumentMasterImportService,
    {
      provide: MARKET_DATA_DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Pool => {
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is required by the market-data module');
        }

        const databaseUrl = new URL(connectionString);
        databaseUrl.searchParams.delete('schema');

        return new Pool({
          connectionString: databaseUrl.toString(),
          max: 10,
          connectionTimeoutMillis: 5_000,
          idleTimeoutMillis: 30_000,
        });
      },
    },
    {
      provide: MARKET_DATA_PROVIDERS,
      useValue: [],
    },
  ],
  exports: [MarketDataProviderRegistry, InstrumentMasterImportService],
})
export class MarketDataModule {}
