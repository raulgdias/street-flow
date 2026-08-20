import { DataSource } from "typeorm";

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

export function createWorkerDataSource(): DataSource {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (isProduction && !databaseUrl) {
    throw new Error("DATABASE_URL é obrigatória em produção");
  }

  return new DataSource({
    type: "postgres",
    ...(databaseUrl
      ? { url: databaseUrl }
      : {
          host: "localhost",
          port: 5432,
          username: "postgres",
          password: "Pa@4816905",
          database: "streetflow",
        }),
    ssl:
      isProduction && isEnabled(process.env.DATABASE_SSL)
        ? { rejectUnauthorized: false }
        : undefined,
    synchronize: false,
  });
}
