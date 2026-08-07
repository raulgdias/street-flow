import { Inject, Injectable } from '@nestjs/common';
import { CreateCustomerCommand } from './create-customer.command';
import { CustomerFactory } from '../../domain/customer.factory';
import { CUSTOMER_REPOSITORY, type CustomerRepository } from '../../domain/customer.repository.interface';
import type { CustomerDto } from '@street-flow/contracts';
import { CircuitBreakerService } from '../../../shared/circuit-breaker/circuit-breaker.service';

@Injectable()
export class CreateCustomerHandler {
  constructor(
    private readonly customerFactory: CustomerFactory,
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<CustomerDto> {
    return this.circuitBreaker.execute('customer-create', async () => {
      const customer = this.customerFactory.create({
        name: command.name,
        email: command.email,
      });

      await this.customerRepository.save(customer);
      return customer.toDto();
    });
  }
}
