import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ProductEntity } from './entities/product.entity';
import { UserEntity, UserRole } from './entities/user.entity';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number | string;
  promoPrice?: number | string | null;
  stock?: number | string;
  imageUrl?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  private normalizePromoPrice(price: number, rawPromoPrice: unknown) {
    const promoPrice =
      rawPromoPrice != null ? Number(rawPromoPrice) : undefined;
    if (
      promoPrice == null ||
      !Number.isFinite(promoPrice) ||
      promoPrice <= 0 ||
      promoPrice >= price
    ) {
      return undefined;
    }
    return promoPrice;
  }

  private mapProduct(product: ProductEntity) {
    const price = Number(product.price);
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price,
      promoPrice: this.normalizePromoPrice(price, product.promoPrice),
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
    };
  }

  async getProducts() {
    const products = await this.products.find({ order: { createdAt: 'ASC' } });
    return products.map((product) => this.mapProduct(product));
  }

  async getProductById(id: string) {
    const product = await this.products.findOneBy({ id });
    return product ? this.mapProduct(product) : null;
  }

  async createProduct(payload: CreateProductInput) {
    const { name, description, price, promoPrice, stock, imageUrl } = payload;
    const numericPrice = Number(price);
    const normalizedPromoPrice = this.normalizePromoPrice(
      numericPrice,
      promoPrice,
    );
    const product = this.products.create({
      name,
      description,
      price: numericPrice,
      promoPrice: normalizedPromoPrice ?? null,
      stock: Number(stock ?? 10),
      imageUrl: imageUrl ?? null,
      isActive: true,
    });
    return this.mapProduct(await this.products.save(product));
  }

  async updateProduct(id: string, payload: UpdateProductInput) {
    const product = await this.products.findOneBy({ id });
    if (!product) return null;

    const nextPrice =
      payload.price != null ? Number(payload.price) : Number(product.price);
    const promoPrice = Object.hasOwn(payload, 'promoPrice')
      ? (this.normalizePromoPrice(nextPrice, payload.promoPrice) ?? null)
      : product.promoPrice;

    this.products.merge(product, {
      ...(payload.name != null && { name: payload.name }),
      ...(payload.description != null && { description: payload.description }),
      ...(payload.price != null && { price: nextPrice }),
      ...(payload.stock != null && { stock: Number(payload.stock) }),
      ...(payload.imageUrl != null && { imageUrl: payload.imageUrl }),
      promoPrice,
    });
    return this.mapProduct(await this.products.save(product));
  }

  async deleteProduct(id: string) {
    const product = await this.products.findOneBy({ id });
    if (!product) return null;
    await this.products.remove(product);
    return this.mapProduct(product);
  }

  async getUsers() {
    return this.users.find({
      select: { id: true, name: true, email: true, role: true },
      order: { createdAt: 'ASC' },
    });
  }

  async createUser(payload: CreateUserInput) {
    const { name, email, passwordHash, role } = payload;
    const user = await this.users.save(
      this.users.create({
        name,
        email,
        passwordHash,
        role: role ?? UserRole.USER,
      }),
    );
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(payload: LoginInput) {
    const { email, password } = payload;

    if (email === 'admin@streetflow.com' && password === 'admin123') {
      return {
        id: 'demo-admin',
        name: 'Admin Street Flow',
        email,
        role: UserRole.ADMIN,
      };
    }

    if (email === 'user@streetflow.com' && password === 'user123') {
      return {
        id: 'demo-user',
        name: 'User Street Flow',
        email,
        role: UserRole.USER,
      };
    }

    const user = await this.users.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });
    if (
      !user ||
      !(await this.authService.comparePassword(password, user.passwordHash))
    ) {
      return null;
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
