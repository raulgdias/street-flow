import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthCheckResponse } from '@street-flow/contracts';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHello(): HealthCheckResponse {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for deployment probes' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): HealthCheckResponse {
    return this.appService.getHello();
  }
}
