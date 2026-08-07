import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerFactory {
  create(input: { name: string; email: string }): Customer {
    return Customer.create({
      id: randomUUID(),
      name: input.name,
      email: input.email,
    });
  }
}
