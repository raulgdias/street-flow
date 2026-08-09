import { BadRequestException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { AuthService } from '../auth/auth.service';
import type { ProductEntity } from './entities/product.entity';
import type { UserEntity } from './entities/user.entity';
import { type CreateProductInput, StoreService } from './store.service';

describe('StoreService product images', () => {
  const products = {} as Repository<ProductEntity>;
  const users = {} as Repository<UserEntity>;
  const authService = {} as AuthService;
  const service = new StoreService(products, users, authService);

  const product = {
    name: 'Street Flow One',
    description: 'Patins elétricos urbanos',
    price: 2990,
    stock: 5,
  };

  it('rejects product creation without an image URL', async () => {
    await expect(
      service.createProduct(product as CreateProductInput),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects non-HTTP image sources', async () => {
    await expect(
      service.createProduct({
        ...product,
        imageUrl: 'data:image/png;base64,abc',
      }),
    ).rejects.toThrow('Informe uma URL de imagem HTTP ou HTTPS válida');
  });
});
