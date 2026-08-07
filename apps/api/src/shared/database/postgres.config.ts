export const postgresConfig = {
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'streetflow',
  password: process.env.POSTGRES_PASSWORD ?? 'streetflow',
  database: process.env.POSTGRES_DB ?? 'streetflow',
};
