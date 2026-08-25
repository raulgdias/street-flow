import { DefaultAzureCredential } from "@azure/identity";
import { DataSource } from "typeorm";

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === "true";
}

const POSTGRESQL_ENTRA_SCOPE =
  "https://ossrdbms-aad.database.windows.net/.default";

function usesManagedIdentity(): boolean {
  return process.env.DB_AUTH_MODE?.trim().toLowerCase() === "managed-identity";
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} é obrigatória ao usar Managed Identity`);
  }
  return value;
}

function managedIdentityConnection() {
  const credential = new DefaultAzureCredential();

  return {
    host: requiredEnvironmentValue("DB_HOST"),
    port: Number(process.env.DB_PORT?.trim() || "5432"),
    database: requiredEnvironmentValue("DB_NAME"),
    username: requiredEnvironmentValue("DB_USER"),
    password: async () => {
      const accessToken = await credential.getToken(POSTGRESQL_ENTRA_SCOPE);
      if (!accessToken) {
        throw new Error(
          "Não foi possível obter um token do Microsoft Entra para o PostgreSQL",
        );
      }
      return accessToken.token;
    },
  };
}

export function createWorkerDataSource(): DataSource {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const managedIdentity = usesManagedIdentity();

  if (isProduction && !databaseUrl && !managedIdentity) {
    throw new Error("DATABASE_URL é obrigatória em produção");
  }

  return new DataSource({
    type: "postgres",
    ...(managedIdentity
      ? managedIdentityConnection()
      : databaseUrl
        ? { url: databaseUrl }
        : {
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: process.env.POSTGRES_PASSWORD || "postgres",
            database: "streetflow",
          }),
    ssl:
      isProduction && isEnabled(process.env.DATABASE_SSL)
        ? { rejectUnauthorized: false }
        : undefined,
    synchronize: false,
  });
}
