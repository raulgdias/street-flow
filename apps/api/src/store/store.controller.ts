import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  async getProducts() {
    return this.storeService.getProducts();
  }

  @Post('products')
  async createProduct(@Body() payload: any) {
    return this.storeService.createProduct(payload);
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() payload: any) {
    return this.storeService.updateProduct(id, payload);
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
  async uploadProductImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem obrigatório');
    }

    const imageUrl = `${process.env.API_BASE_URL ?? 'http://localhost:3000'}/uploads/${file.filename}`;
    return this.storeService.updateProduct(id, { imageUrl });
  }

  @Get('users')
  async getUsers() {
    return this.storeService.getUsers();
  }

  @Post('auth/login')
  async login(@Body() payload: any) {
    return this.storeService.login(payload);
  }
}
