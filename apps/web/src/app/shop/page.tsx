"use client";

import {
  ArrowRight,
  Check,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildApiUrl, normalizeImageUrl } from "@/config/environment";
import {
  fallbackImage,
  formatCurrency,
  normalizeProduct,
  readCart,
  type CartItem,
  type Product,
  writeCart,
} from "@/lib/store";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCart(readCart()), 0);

    fetch(buildApiUrl("/store/products"))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = (await response.json()) as Record<string, unknown>[];
        setProducts(
          data.map((product) => {
            const normalized = normalizeProduct(product);
            return {
              ...normalized,
              imageUrl: normalizeImageUrl(normalized.imageUrl) || fallbackImage,
            };
          }),
        );
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));

    return () => window.clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      `${product.name} ${product.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery),
    );
  }, [products, query]);

  const addToCart = (product: Product) => {
    const nextCart = cart.some((item) => item.id === product.id)
      ? cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Math.max(product.stock, 1),
                ),
              }
            : item,
        )
      : [...cart, { ...product, quantity: 1 }];

    setCart(nextCart);
    writeCart(nextCart);
    setAddedProduct(product.id);
    window.setTimeout(() => setAddedProduct(null), 1400);
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-forest-950/10">
          <div className="container-shell py-14 md:py-20">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="eyebrow text-coral-500">Coleção Street Flow</p>
                <h1 className="font-display mt-4 text-5xl font-bold leading-[0.9] tracking-[-0.075em] sm:text-6xl md:text-7xl">
                  Encontre seu
                  <br />
                  modo de fluir.
                </h1>
              </div>
              <p className="max-w-xl text-base leading-7 text-forest-950/60 lg:justify-self-end">
                Performance para diferentes rotinas, a mesma sensação de
                liberdade. Compare os modelos e escolha o patins que acompanha a
                sua cidade.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-forest-950/10 bg-white p-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Buscar produtos</span>
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-950/40"
                  size={19}
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 w-full rounded-xl bg-cream-50 pl-12 pr-4 text-sm font-medium outline-none ring-lime-300 focus:ring-2"
                  placeholder="Busque por modelo ou característica"
                />
              </label>
              <div className="flex items-center justify-between gap-3 px-3 text-sm text-forest-950/55 sm:justify-end">
                <SlidersHorizontal size={17} />
                <span>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "modelo" : "modelos"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell py-12 md:py-16">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[500px] animate-pulse rounded-[1.75rem] bg-cream-100"
                />
              ))}
            </div>
          ) : loadFailed ? (
            <div className="paper-card py-20 text-center">
              <p className="eyebrow text-coral-500">Conexão interrompida</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.05em]">
                O catálogo deu uma pausa.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-forest-950/55">
                Tente atualizar a página em alguns instantes.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="paper-card py-20 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime-300">
                <ShoppingBag size={22} />
              </span>
              <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em]">
                {products.length === 0
                  ? "Novos modelos chegando."
                  : "Nenhum modelo encontrado."}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-forest-950/55">
                {products.length === 0
                  ? "Estamos preparando o primeiro drop da Street Flow. Volte em breve."
                  : "Tente buscar com outro termo para continuar explorando."}
              </p>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="button-secondary mt-7"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product, index) => {
                const sellingPrice = product.promoPrice ?? product.price;
                const discount = product.promoPrice
                  ? Math.round((1 - product.promoPrice / product.price) * 100)
                  : 0;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-forest-950/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(16,39,30,.12)]"
                  >
                    <div
                      className="relative aspect-[4/3] overflow-hidden bg-cream-100 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{
                        backgroundImage: `url(${product.imageUrl || fallbackImage})`,
                      }}
                      role="img"
                      aria-label={product.name}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/30 to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-cream-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                        {index === 0 ? "Mais escolhido" : "Street ready"}
                      </span>
                      {discount > 0 && (
                        <span className="absolute right-4 top-4 rounded-full bg-coral-500 px-3 py-1.5 text-[11px] font-extrabold text-white">
                          −{discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-display text-2xl font-bold tracking-[-0.045em]">
                            {product.name}
                          </h2>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-forest-950/55">
                            {product.description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${product.stock > 0 ? "bg-lime-400" : "bg-coral-500"}`}
                          title={product.stock > 0 ? "Em estoque" : "Esgotado"}
                        />
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-4 border-t border-forest-950/10 pt-5">
                        <div>
                          <p className="text-xs font-bold text-forest-950/45">
                            a partir de
                          </p>
                          <p className="font-display text-2xl font-bold tracking-[-0.04em]">
                            {formatCurrency(sellingPrice)}
                          </p>
                          {product.promoPrice && (
                            <p className="text-xs text-forest-950/40 line-through">
                              {formatCurrency(product.price)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="grid size-12 place-items-center rounded-full bg-forest-950 text-white transition hover:bg-coral-500 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`Adicionar ${product.name} à sacola`}
                        >
                          {addedProduct === product.id ? (
                            <Check size={20} />
                          ) : (
                            <ArrowRight size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
