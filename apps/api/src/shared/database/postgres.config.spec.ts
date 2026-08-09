import { postgresConfig } from './postgres.config';

describe('postgresConfig', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DATABASE_URL = originalDatabaseUrl;
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
  });

  it('uses DATABASE_URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://production/database';

    expect(postgresConfig()).toMatchObject({
      url: 'postgresql://production/database',
    });
    expect(postgresConfig()).not.toHaveProperty('host');
  });
});
