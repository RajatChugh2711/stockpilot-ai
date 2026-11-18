import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check whether the API process is responding' })
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'stockpilot-api',
      timestamp: new Date().toISOString(),
    };
  }
}
