import { getMetadataArgsStorage } from 'typeorm';
import { CartItemEntity } from './cart-item.entity';
import { CartEntity } from './cart.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderEntity } from './order.entity';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

const entities = [
  UserEntity,
  ProductEntity,
  CartEntity,
  CartItemEntity,
  OrderEntity,
  OrderItemEntity,
];

describe('UUID primary keys', () => {
  it.each(entities)('%s generates its UUID in the application', (Entity) => {
    const entity = new Entity();

    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(
      getMetadataArgsStorage().generations.some(
        (generation) =>
          generation.target === Entity && generation.propertyName === 'id',
      ),
    ).toBe(false);
  });
});
