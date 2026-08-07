export class CreateCustomerCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}
