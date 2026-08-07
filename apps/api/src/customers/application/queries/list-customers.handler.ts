import { Inject, Injectable } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, type CustomerRepository } from '../../domain/customer.repository.interface';
import type { CustomerDto } from '@street-flow/contracts';

@Injectable()
export class ListCustomersHandler {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(): Promise<CustomerDto[]> {
    const customers = await this.customerRepository.findAll();
    return customers.map((customer) => customer.toDto());
  }
}
