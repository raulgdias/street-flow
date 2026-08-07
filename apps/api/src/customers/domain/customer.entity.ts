import { CustomerDto } from '@street-flow/contracts';

export type CustomerStatus = 'active' | 'inactive';

export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly status: CustomerStatus,
  ) {}

  static create(input: { id: string; name: string; email: string }): Customer {
    return new Customer(input.id, input.name, input.email, 'active');
  }

  toDto(): CustomerDto {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
    };
  }
}
