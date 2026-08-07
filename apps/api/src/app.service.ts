import { Injectable } from '@nestjs/common';
import type { HealthCheckResponse } from '@street-flow/contracts';

@Injectable()
export class AppService {
  getHello(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }
}
