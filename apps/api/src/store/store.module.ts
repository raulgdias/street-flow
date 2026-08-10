import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { ProductEntity } from './entities/product.entity';
import { UserEntity } from './entities/user.entity';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OutboxEventEntity } from './entities/outbox-event.entity';
import { OrdersPublisher } from './orders.publisher';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      CartEntity,
      CartItemEntity,
      OrderEntity,
      OrderItemEntity,
      OutboxEventEntity,
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService, OrdersPublisher],
  exports: [StoreService],
})
export class StoreModule {}
