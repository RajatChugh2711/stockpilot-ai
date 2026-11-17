import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketDataProviderRegistry } from '../application/market-data-provider.registry';

@ApiTags('Market Data')
@Controller('market-data')
export class MarketDataController {
  constructor(private readonly providerRegistry: MarketDataProviderRegistry) {}

  @Get('providers')
  @ApiOperation({ summary: 'List configured market-data providers and their capabilities' })
  getProviders(): {
    status: 'configured' | 'not_configured';
    count: number;
    providers: ReturnType<MarketDataProviderRegistry['listCapabilities']>;
  } {
    const providers = this.providerRegistry.listCapabilities();

    return {
      status: providers.length > 0 ? 'configured' : 'not_configured',
      count: providers.length,
      providers,
    };
  }
}
