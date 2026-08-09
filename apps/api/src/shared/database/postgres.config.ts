import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CartItemEntity } from '../../store/entities/cart-item.entity';
import { CartEntity } from '../../store/entities/cart.entity';
import { OrderItemEntity } from '../../store/entities/order-item.entity';
import { OrderEntity } from '../../store/entities/order.entity';
import { ProductEntity } from '../../store/entities/product.entity';
import { UserEntity } from '../../store/entities/user.entity';

function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

export function postgresConfig(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (isProduction && !databaseUrl) {
    throw new Error('DATABASE_URL é obrigatória em produção');
  }

  const connection = isProduction
    ? { url: databaseUrl }
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
    // Explicit entities make schema synchronization reliable in bundled deployments.
    entities: [
      UserEntity,
      ProductEntity,
      CartEntity,
      CartItemEntity,
      OrderEntity,
      OrderItemEntity,
    ],
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
    logging: isEnabled(process.env.TYPEORM_LOGGING)
      ? ['error', 'schema', 'warn']
      : ['error'],
  };
}
