import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

export function postgresConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const connection = isProduction
    ? { url: process.env.DATABASE_URL }
    : {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Pa@4816905',
        database: 'streetflow',
      };

  return {
    type: 'postgres',
    ...connection,
    autoLoadEntities: true,
    // This MVP bootstraps empty local and production databases automatically.
    synchronize:
      process.env.TYPEORM_SYNCHRONIZE == null
        ? true
        : isEnabled(process.env.TYPEORM_SYNCHRONIZE),
    ssl:
      isProduction && isEnabled(process.env.DATABASE_SSL)
        ? { rejectUnauthorized: false }
        : undefined,
    retryAttempts: 10,
    retryDelay: 3_000,
    logging: isEnabled(process.env.TYPEORM_LOGGING),
  };
}
