import { Module } from '@nestjs/common';
import { CustomersController } from './presentation/customers.controller';
import { CreateCustomerHandler } from './application/commands/create-customer.handler';
import { ListCustomersHandler } from './application/queries/list-customers.handler';
import { CustomerFactory } from './domain/customer.factory';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository.interface';
import { InMemoryCustomerRepository } from './infrastructure/customer.repository';
import { CircuitBreakerService } from '../shared/circuit-breaker/circuit-breaker.service';

@Module({
  controllers: [CustomersController],
  providers: [
    CreateCustomerHandler,
    ListCustomersHandler,
    CustomerFactory,
    CircuitBreakerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: InMemoryCustomerRepository,
    },
  ],
})
export class CustomersModule {}
