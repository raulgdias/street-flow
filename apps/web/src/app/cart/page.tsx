"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fallbackImage,
  formatCurrency,
  readCart,
  type CartItem,
  writeCart,
} from "@/lib/store";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setCart(readCart()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.promoPrice ?? item.price) * item.quantity,
        0,
      ),
    [cart],
  );

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const commitCart = (nextCart: CartItem[]) => {
    setCart(nextCart);
    writeCart(nextCart);
  };

  const updateQuantity = (id: string, delta: number) => {
    commitCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  Math.min(item.quantity + delta, Math.max(item.stock, 1)),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id: string) =>
    commitCart(cart.filter((item) => item.id !== id));

  const checkout = () => {
    const role = localStorage.getItem("streetflow-role");
    if (!role) {
      router.push("/login?redirect=/cart");
      return;
    }

    window.alert(
      "Pedido confirmado! Em breve você receberá os próximos passos por e-mail.",
    );
    commitCart([]);
  };

  return (
    <>
      <SiteHeader />
      <main className="container-shell py-12 md:py-20">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-950/60 transition hover:text-forest-950"
        >
          <ArrowLeft size={17} /> Continuar comprando
        </Link>

        <div className="mt-8 flex flex-col gap-3 border-b border-forest-950/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-coral-500">Sua seleção</p>
            <h1 className="font-display mt-3 text-5xl font-bold tracking-[-0.07em] md:text-6xl">
              Minha sacola.
            </h1>
          </div>
          <p className="text-sm font-bold text-forest-950/50">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </p>
        </div>

        {cart.length === 0 ? (
          <section className="paper-card mt-10 grid min-h-[400px] place-items-center px-6 py-16 text-center">
            <div>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-300">
                <ShoppingBag size={26} />
              </span>
              <h2 className="font-display mt-6 text-3xl font-bold tracking-[-0.05em]">
                Sua sacola está leve.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-forest-950/55">
                Escolha um modelo e comece a desenhar sua próxima rota pela
                cidade.
              </p>
              <Link href="/shop" className="button-primary mt-7">
                Explorar patins
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <section className="grid gap-4" aria-label="Produtos na sacola">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-5 rounded-[1.5rem] border border-forest-950/10 bg-white p-4 sm:grid-cols-[150px_1fr] sm:p-5"
                >
                  <div
                    className="aspect-square rounded-[1.1rem] bg-cream-100 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${item.imageUrl || fallbackImage})`,
                    }}
                    role="img"
                    aria-label={item.name}
                  />
                  <div className="flex min-w-0 flex-col justify-between gap-5 py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-bold tracking-[-0.04em]">
                          {item.name}
                        </h2>
                        <p className="mt-1 text-xs font-bold text-forest-950/45">
                          Pronto para envio
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="icon-button size-9 shrink-0 text-coral-600"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-forest-950/12 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="grid size-8 place-items-center rounded-full hover:bg-cream-100"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-9 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="grid size-8 place-items-center rounded-full hover:bg-cream-100"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-forest-950/45">
                          {formatCurrency(item.promoPrice ?? item.price)} cada
                        </p>
                        <p className="font-display text-xl font-bold">
                          {formatCurrency(
                            (item.promoPrice ?? item.price) * item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[1.75rem] bg-forest-950 p-6 text-white lg:sticky lg:top-28 md:p-8">
              <p className="eyebrow text-lime-300">Resumo</p>
              <div className="mt-7 grid gap-4 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Frete</span>
                  <span className="font-bold text-lime-300">Grátis</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-6">
                <span className="font-bold">Total</span>
                <span className="font-display text-3xl font-bold tracking-[-0.04em]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <button onClick={checkout} className="button-lime mt-7 w-full">
                Finalizar compra
              </button>
              <div className="mt-7 grid gap-3 border-t border-white/15 pt-6 text-xs text-white/55">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-lime-300" /> Compra
                  protegida e segura
                </p>
                <p className="flex items-center gap-2">
                  <Truck size={16} className="text-lime-300" /> Frete grátis
                  para todo o Brasil
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-lime-300" /> 7 dias
                  para troca ou devolução
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
