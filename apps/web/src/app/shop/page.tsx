"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { buildApiUrl, normalizeImageUrl } from '@/config/environment';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  stock: number;
  imageUrl: string;
};

type CartItem = Product & { quantity: number };

const fallbackImage = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';

const toNumber = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number | string | null | undefined) => toNumber(value).toFixed(2);

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [role, setRole] = useState<'Admin' | 'User' | 'Guest'>('Guest');

  useEffect(() => {
    const storedRole = localStorage.getItem('streetflow-role');
    if (storedRole === 'Admin' || storedRole === 'User') {
      setRole(storedRole);
    }

    const storedCart = localStorage.getItem('streetflow-cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem('streetflow-cart');
      }
    }

    fetch(buildApiUrl('/store/products'))
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load products: ${res.status}`);
        }

        const data = await res.json();
        setProducts(
          data.map((product: any) => ({
            ...product,
            price: toNumber(product.price),
            promoPrice: product.promoPrice ? toNumber(product.promoPrice) : undefined,
            stock: toNumber(product.stock),
            imageUrl: normalizeImageUrl(product.imageUrl ?? product.image_url ?? fallbackImage),
          })),
        );
      })
      .catch((error) => {
        console.error('Failed to load products from backend:', error);
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('streetflow-cart', JSON.stringify(cart));
  }, [cart]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + toNumber(item.promoPrice ?? item.price) * item.quantity, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">Catálogo</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Patins elétricos Street Flow</h1>
            <p className="mt-2 text-sm text-slate-600">Navegue livremente, adicione itens e finalize o pedido só quando quiser.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Início</Link>
            <Link href="/cart" className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Carrinho ({cart.length})</Link>
            {role === 'Admin' ? (
              <Link href="/admin" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Admin</Link>
            ) : (
              <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Login</Link>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <img src={product.imageUrl || fallbackImage} alt={product.name} className="h-44 w-full object-cover" />
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                    <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      {product.promoPrice ? (
                        <>
                          <p className="text-lg font-semibold text-cyan-700">R$ {formatCurrency(product.promoPrice)}</p>
                          <p className="text-sm text-slate-400 line-through">R$ {formatCurrency(product.price)}</p>
                        </>
                      ) : (
                        <p className="text-lg font-semibold text-slate-900">R$ {formatCurrency(product.price)}</p>
                      )}
                    </div>
                    <button onClick={() => addToCart(product)} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Adicionar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
