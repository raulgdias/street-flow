import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  type CreateProductInput,
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

  @Post('products/:id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(__dirname, '..', 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExt = extname(file.originalname);
          callback(null, `${uniqueSuffix}${fileExt}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowed = /jpeg|jpg|png|gif/;
        if (allowed.test(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Formato de imagem inválido'), false);
        }
      },
    }),
  )
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem obrigatório');
    }

    const publicBaseUrl =
      process.env.API_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_API_URL?.trim() ||
      'http://localhost:3000';
    const imageUrl = `${publicBaseUrl.replace(/\/$/, '')}/uploads/${file.filename}`;
    return this.storeService.updateProduct(id, { imageUrl });
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
