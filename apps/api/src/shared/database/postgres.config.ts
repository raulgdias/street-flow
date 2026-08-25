import { DefaultAzureCredential } from '@azure/identity';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CartItemEntity } from '../../store/entities/cart-item.entity';
import { CartEntity } from '../../store/entities/cart.entity';
import { OrderItemEntity } from '../../store/entities/order-item.entity';
import { OrderEntity } from '../../store/entities/order.entity';
import { OutboxEventEntity } from '../../store/entities/outbox-event.entity';
import { ProductEntity } from '../../store/entities/product.entity';
import { UserEntity } from '../../store/entities/user.entity';

export function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

export function shouldSynchronizeSchema(): boolean {
  return process.env.TYPEORM_SYNCHRONIZE == null
    ? true
    : isEnabled(process.env.TYPEORM_SYNCHRONIZE);
}

const POSTGRESQL_ENTRA_SCOPE =
  'https://ossrdbms-aad.database.windows.net/.default';

function usesManagedIdentity(): boolean {
  return process.env.DB_AUTH_MODE?.trim().toLowerCase() === 'managed-identity';
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
    host: requiredEnvironmentValue('DB_HOST'),
    port: Number(process.env.DB_PORT?.trim() || '5432'),
    database: requiredEnvironmentValue('DB_NAME'),
    username: requiredEnvironmentValue('DB_USER'),
    password: async () => {
      const accessToken = await credential.getToken(POSTGRESQL_ENTRA_SCOPE);
      if (!accessToken) {
        throw new Error(
          'Não foi possível obter um token do Microsoft Entra para o PostgreSQL',
        );
      }
      return accessToken.token;
    },
  };
}

export function postgresConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const managedIdentity = usesManagedIdentity();

  if (isProduction && !databaseUrl && !managedIdentity) {
    throw new Error('DATABASE_URL é obrigatória em produção');
  }

  if (isProduction && databaseUrl) {
    const parsedUrl = new URL(databaseUrl);
    if (
      parsedUrl.protocol !== 'postgres:' &&
      parsedUrl.protocol !== 'postgresql:'
    ) {
      throw new Error(
        'DATABASE_URL deve começar com postgres:// ou postgresql://',
      );
    }

    const databaseName =
      parsedUrl.pathname.replace(/^\//, '') || '(não informado)';
    console.info(
      `[database] configuração de produção: host=${parsedUrl.hostname} port=${parsedUrl.port || '5432'} database=${databaseName} ssl=${isEnabled(process.env.DATABASE_SSL)}`,
    );
  }

  if (managedIdentity) {
    console.info(
      `[database] configuração Managed Identity: host=${process.env.DB_HOST} port=${process.env.DB_PORT || '5432'} database=${process.env.DB_NAME} user=${process.env.DB_USER} ssl=${isEnabled(process.env.DATABASE_SSL)}`,
    );
  }

  const connection = managedIdentity
    ? managedIdentityConnection()
    : databaseUrl
      ? { url: databaseUrl }
      : {
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: 'streetflow',
        };

  return {
    type: 'postgres',
    ...connection,
    // Explicit entities make schema synchronization reliable in bundled deployments.
    entities: [
      UserEntity,
      ProductEntity,
      CartEntity,
      CartItemEntity,
      OrderEntity,
      OrderItemEntity,
      OutboxEventEntity,
    ],
    // Synchronization is performed explicitly during bootstrap for clear logs.
    synchronize: false,
    ssl:
      isProduction && isEnabled(process.env.DATABASE_SSL)
        ? { rejectUnauthorized: false }
        : undefined,
    retryAttempts: 3,
    retryDelay: 2_000,
    connectTimeoutMS: 10_000,
    logging: isEnabled(process.env.TYPEORM_LOGGING)
      ? ['error', 'schema', 'warn']
      : ['error'],
  };
}
