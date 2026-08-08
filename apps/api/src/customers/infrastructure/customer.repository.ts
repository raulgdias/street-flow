import { Injectable } from '@nestjs/common';
import { Customer } from '../domain/customer.entity';
import { CustomerRepository } from '../domain/customer.repository.interface';

@Injectable()
export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers: Customer[] = [];

  save(customer: Customer): Promise<Customer> {
    this.customers.push(customer);
    return Promise.resolve(customer);
  }

  findAll(): Promise<Customer[]> {
    return Promise.resolve(this.customers);
  }
}
