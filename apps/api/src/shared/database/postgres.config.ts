import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

export function postgresConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    // Production is currently empty and must bootstrap itself on first start.
    // TYPEORM_SYNCHRONIZE can also enable this behavior in preview environments.
    synchronize: isProduction || isEnabled(process.env.TYPEORM_SYNCHRONIZE),
    ssl: isEnabled(process.env.DATABASE_SSL)
      ? { rejectUnauthorized: false }
      : undefined,
    retryAttempts: 10,
    retryDelay: 3_000,
    logging: isEnabled(process.env.TYPEORM_LOGGING),
  };
}
