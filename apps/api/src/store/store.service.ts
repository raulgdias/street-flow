import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class StoreService {
  private readonly pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Pa@4816905',
    database: 'Local',
  });

  private normalizePromoPrice(price: number, rawPromoPrice: any) {
    const promoPrice = rawPromoPrice != null ? Number(rawPromoPrice) : undefined;
    if (promoPrice == null || !Number.isFinite(promoPrice) || promoPrice <= 0 || promoPrice >= price) {
      return undefined;
    }
    return promoPrice;
  }

  private mapProduct(row: any) {
    const price = Number(row.price);
    return {
      id: String(row.id),
      name: row.name,
      description: row.description,
      price,
      promoPrice: this.normalizePromoPrice(price, row.promo_price),
      stock: Number(row.stock),
      imageUrl: row.image_url ?? row.imageUrl ?? null,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async getProducts() {
    const result = await this.pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows.map((row) => this.mapProduct(row));
  }

  async getProductById(id: string) {
    const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ? this.mapProduct(result.rows[0]) : null;
  }

  async createProduct(payload: any) {
    const { name, description, price, promoPrice, stock, imageUrl } = payload;
    const numericPrice = Number(price);
    const normalizedPromoPrice = this.normalizePromoPrice(numericPrice, promoPrice);
    const result = await this.pool.query(
      `INSERT INTO products (name, description, price, promo_price, stock, image_url, is_active) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [name, description, numericPrice, normalizedPromoPrice ?? null, stock ?? 10, imageUrl ?? null],
    );
    return result.rows[0];
  }

  async updateProduct(id: string, payload: any) {
    const { name, description, price, promoPrice, stock, imageUrl } = payload;
    const numericPrice = Number(price);
    const normalizedPromoPrice = this.normalizePromoPrice(numericPrice, promoPrice);
    const result = await this.pool.query(
      `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), promo_price = $4, stock = COALESCE($5, stock), image_url = COALESCE($6, image_url) WHERE id = $7 RETURNING *`,
      [name ?? null, description ?? null, Number(price) ?? null, normalizedPromoPrice ?? null, stock ?? null, imageUrl ?? null, id],
    );
    return result.rows[0];
  }

  async getUsers() {
    const result = await this.pool.query('SELECT id, name, email, role FROM users ORDER BY id ASC');
    return result.rows;
  }

  async createUser(payload: any) {
    const { name, email, passwordHash, role } = payload;
    const result = await this.pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, passwordHash, role],
    );
    return result.rows[0];
  }

  async login(payload: any) {
    const { email, password } = payload;

    if (email === 'admin@streetflow.com' && password === 'admin123') {
      return { id: 1, name: 'Admin Street Flow', email, role: 'ADMIN' };
    }

    if (email === 'user@streetflow.com' && password === 'user123') {
      return { id: 2, name: 'User Street Flow', email, role: 'USER' };
    }

    const result = await this.pool.query('SELECT id, name, email, role, password_hash FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return null;
    }

    const user = result.rows[0];
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
