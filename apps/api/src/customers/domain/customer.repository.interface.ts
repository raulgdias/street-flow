import { Customer } from './customer.entity';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findAll(): Promise<Customer[]>;
}
