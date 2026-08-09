import { postgresConfig, shouldSynchronizeSchema } from './postgres.config';

describe('postgresConfig', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSynchronize = process.env.TYPEORM_SYNCHRONIZE;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DATABASE_URL = originalDatabaseUrl;
    process.env.TYPEORM_SYNCHRONIZE = originalSynchronize;
  });

  it('uses the local PostgreSQL server outside production', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgresql://should-not-be-used';

    expect(postgresConfig()).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Pa@4816905',
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

  it('synchronizes by default and supports an explicit opt-out', () => {
    delete process.env.TYPEORM_SYNCHRONIZE;
    expect(shouldSynchronizeSchema()).toBe(true);

    process.env.TYPEORM_SYNCHRONIZE = 'false';
    expect(shouldSynchronizeSchema()).toBe(false);
  });
});
