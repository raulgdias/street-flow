"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  quantity: number;
};

const toNumber = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number | string | null | undefined) => toNumber(value).toFixed(2);

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('streetflow-cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setCart(
          parsed.map((item) => {
            const price = toNumber(item.price);
            const promoPrice = toNumber(item.promoPrice);
            return {
              ...item,
              price,
              promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : undefined,
              quantity: Number(item.quantity) || 0,
            };
          }),
        );
      } catch {
        localStorage.removeItem('streetflow-cart');
      }
    }
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + toNumber(item.promoPrice ?? item.price) * item.quantity, 0), [cart]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const checkout = () => {
    const role = localStorage.getItem('streetflow-role');
    if (!role) {
      router.push('/login?redirect=/cart');
      return;
    }

    alert('Pedido confirmado com sucesso. O fluxo de checkout está pronto para expansão futura.');
    localStorage.removeItem('streetflow-cart');
    setCart([]);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">Carrinho</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Seu pedido</h1>
          </div>
          <Link href="/shop" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Voltar ao catálogo</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.7fr]">
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
                Seu carrinho está vazio. Adicione produtos para continuar.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">R$ {formatCurrency(item.promoPrice ?? item.price)} cada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="rounded-full border border-slate-300 px-3 py-1 text-sm">-</button>
                      <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="rounded-full border border-slate-300 px-3 py-1 text-sm">+</button>
                      <button onClick={() => removeItem(item.id)} className="ml-2 text-sm font-semibold text-rose-600">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Resumo</h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Total</span>
                <span className="text-2xl font-semibold text-slate-900">R$ {formatCurrency(total)}</span>
              </div>
              <button onClick={checkout} className="mt-4 w-full rounded-full bg-cyan-600 px-4 py-3 font-semibold text-white">
                Finalizar compra
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
