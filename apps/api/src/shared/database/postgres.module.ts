import { Module } from '@nestjs/common';
import { postgresConfig } from './postgres.config';

@Module({
  providers: [
    {
      provide: 'POSTGRES_CONFIG',
      useValue: postgresConfig,
    },
  ],
  exports: ['POSTGRES_CONFIG'],
})
export class PostgresModule {}
