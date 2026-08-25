import { postgresConfig, shouldSynchronizeSchema } from './postgres.config';

describe('postgresConfig', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalDbAuthMode = process.env.DB_AUTH_MODE;
  const originalDbHost = process.env.DB_HOST;
  const originalDbPort = process.env.DB_PORT;
  const originalDbName = process.env.DB_NAME;
  const originalDbUser = process.env.DB_USER;
  const originalPostgresPassword = process.env.POSTGRES_PASSWORD;
  const originalSynchronize = process.env.TYPEORM_SYNCHRONIZE;

  function restoreEnvironmentValue(
    name: string,
    value: string | undefined,
  ): void {
    if (value === undefined) {
      delete process.env[name];
      return;
    }
    process.env[name] = value;
  }

  afterEach(() => {
    restoreEnvironmentValue('NODE_ENV', originalNodeEnv);
    restoreEnvironmentValue('DATABASE_URL', originalDatabaseUrl);
    restoreEnvironmentValue('DB_AUTH_MODE', originalDbAuthMode);
    restoreEnvironmentValue('DB_HOST', originalDbHost);
    restoreEnvironmentValue('DB_PORT', originalDbPort);
    restoreEnvironmentValue('DB_NAME', originalDbName);
    restoreEnvironmentValue('DB_USER', originalDbUser);
    restoreEnvironmentValue('POSTGRES_PASSWORD', originalPostgresPassword);
    restoreEnvironmentValue('TYPEORM_SYNCHRONIZE', originalSynchronize);
  });

  it('uses DATABASE_URL when configured outside production', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://docker-network/streetflow';

    expect(postgresConfig()).toMatchObject({
      url: 'postgresql://docker-network/streetflow',
    });
    expect(postgresConfig()).not.toHaveProperty('host');
    expect(postgresConfig()).toHaveProperty('synchronize', false);
  });

  it('uses the local PostgreSQL server when DATABASE_URL is absent', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;

    expect(postgresConfig()).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'streetflow',
    });
    expect(postgresConfig()).not.toHaveProperty('url');
    expect(postgresConfig()).toHaveProperty('synchronize', false);
  });

  it('uses DATABASE_URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://production/database';

    expect(postgresConfig()).toMatchObject({
      url: 'postgresql://production/database',
    });
    expect(postgresConfig()).not.toHaveProperty('host');
  });

  it('requires DATABASE_URL in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;

    expect(postgresConfig).toThrow('DATABASE_URL é obrigatória em produção');
  });

  it('uses Microsoft Entra token authentication when configured', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;
    process.env.DB_AUTH_MODE = 'managed-identity';
    process.env.DB_HOST = 'street-flow-db.postgres.database.azure.com';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'wedding';
    process.env.DB_USER = 'streetflow-api';

    expect(postgresConfig()).toMatchObject({
      host: 'street-flow-db.postgres.database.azure.com',
      port: 5432,
      database: 'wedding',
      username: 'streetflow-api',
    });
    expect(postgresConfig()).not.toHaveProperty('url');
    expect(postgresConfig().password).toEqual(expect.any(Function));
  });

  it('synchronizes by default and supports an explicit opt-out', () => {
    delete process.env.TYPEORM_SYNCHRONIZE;
    expect(shouldSynchronizeSchema()).toBe(true);

    process.env.TYPEORM_SYNCHRONIZE = 'false';
    expect(shouldSynchronizeSchema()).toBe(false);
  });
});
