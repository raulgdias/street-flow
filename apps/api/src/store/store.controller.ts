import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  type CreateProductInput,
  type CreateOrderInput,
  type LoginInput,
  StoreService,
  type UpdateProductInput,
} from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  async getProducts() {
    return this.storeService.getProducts();
  }

  @Post('products')
  async createProduct(@Body() payload: CreateProductInput) {
    return this.storeService.createProduct(payload);
  }

  @Post('orders')
  async createOrder(@Body() payload: CreateOrderInput) {
    return this.storeService.createOrder(payload);
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductInput,
  ) {
    return this.storeService.updateProduct(id, payload);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.storeService.deleteProduct(id);
  }

  @Get('users')
  async getUsers() {
    return this.storeService.getUsers();
  }

  @Post('auth/login')
  async login(@Body() payload: LoginInput) {
    return this.storeService.login(payload);
  }
}
