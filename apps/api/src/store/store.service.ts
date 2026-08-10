import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ProductEntity } from './entities/product.entity';
import { UserEntity, UserRole } from './entities/user.entity';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import {
  OutboxEventEntity,
  OutboxEventType,
} from './entities/outbox-event.entity';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number | string;
  promoPrice?: number | string | null;
  stock?: number | string;
  imageUrl: string;
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

export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
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

  private async ensureDemoUser(
    id: string,
    name: string,
    email: string,
    role: UserRole,
  ) {
    const existingUser = await this.users.findOneBy({ id });
    if (existingUser) return existingUser;

    return this.users.save(
      this.users.create({
        id,
        name,
        email,
        role,
        passwordHash: 'demo-account',
      }),
    );
  }

  private validateImageUrl(
    value: string | null | undefined,
    required = false,
  ): string | null {
    const imageUrl = value?.trim();
    if (!imageUrl) {
      if (required) {
        throw new BadRequestException('A URL da imagem é obrigatória');
      }
      return null;
    }

    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Unsupported protocol');
      }
      return parsedUrl.toString();
    } catch {
      throw new BadRequestException(
        'Informe uma URL de imagem HTTP ou HTTPS válida',
      );
    }
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
      imageUrl: this.validateImageUrl(imageUrl, true),
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
      ...(Object.hasOwn(payload, 'imageUrl') && {
        imageUrl: this.validateImageUrl(payload.imageUrl),
      }),
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
      const user = await this.ensureDemoUser(
        '00000000-0000-4000-8000-000000000001',
        'Admin Street Flow',
        email,
        UserRole.ADMIN,
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    if (email === 'user@streetflow.com' && password === 'user123') {
      const user = await this.ensureDemoUser(
        '00000000-0000-4000-8000-000000000002',
        'User Street Flow',
        email,
        UserRole.USER,
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

  async createOrder(payload: CreateOrderInput) {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new BadRequestException('O pedido precisa conter ao menos um item');
    }

    const requestedItems = new Map<string, number>();
    for (const item of payload.items) {
      const quantity = Number(item.quantity);
      if (!item?.productId || !Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException('Os itens do pedido são inválidos');
      }
      requestedItems.set(
        item.productId,
        (requestedItems.get(item.productId) ?? 0) + quantity,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(UserEntity, {
        where: { id: payload.userId },
      });
      if (!user) throw new BadRequestException('Cliente não encontrado');

      const products = await manager.find(ProductEntity, {
        where: { id: In([...requestedItems.keys()]) },
        lock: { mode: 'pessimistic_write' },
      });
      if (products.length !== requestedItems.size) {
        throw new BadRequestException(
          'Um ou mais produtos não foram encontrados',
        );
      }

      const orderItems = products.map((product) => {
        const quantity = requestedItems.get(product.id)!;
        if (!product.isActive || product.stock < quantity) {
          throw new BadRequestException(
            `Produto indisponível: ${product.name}`,
          );
        }
        return {
          product,
          quantity,
          unitPrice: product.promoPrice ?? product.price,
        };
      });
      const total = orderItems.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

      const order = await manager.save(
        manager.create(OrderEntity, {
          user,
          total,
          status: OrderStatus.PENDING,
        }),
      );
      await manager.save(
        products.map((product) => {
          product.stock -= requestedItems.get(product.id)!;
          return product;
        }),
      );
      await manager.save(
        orderItems.map((item) =>
          manager.create(OrderItemEntity, {
            order,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }),
        ),
      );

      const eventPayload = {
        eventId: undefined as string | undefined,
        eventType: OutboxEventType.ORDER_CREATED,
        occurredAt: new Date().toISOString(),
        version: 1,
        order: {
          id: order.id,
          userId: user.id,
          total,
          status: order.status,
          items: orderItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
        },
      };
      const event = manager.create(OutboxEventEntity, {
        aggregateId: order.id,
        eventType: OutboxEventType.ORDER_CREATED,
        payload: eventPayload,
      });
      event.payload.eventId = event.id;
      await manager.save(event);

      return {
        id: order.id,
        status: order.status,
        total,
        createdAt: order.createdAt,
      };
    });
  }
}
