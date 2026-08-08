import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCustomerCommand } from '../application/commands/create-customer.command';
import { CreateCustomerHandler } from '../application/commands/create-customer.handler';
import { ListCustomersHandler } from '../application/queries/list-customers.handler';
import type {
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomerDto,
} from '@street-flow/contracts';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomerHandler: CreateCustomerHandler,
    private readonly listCustomersHandler: ListCustomersHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async create(
    @Body() body: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const customer = await this.createCustomerHandler.execute(
      new CreateCustomerCommand(body.name, body.email),
    );
    return { customer };
  }

  @Get()
  @ApiOperation({ summary: 'List customers' })
  async list(): Promise<CustomerDto[]> {
    return this.listCustomersHandler.execute();
  }
}
