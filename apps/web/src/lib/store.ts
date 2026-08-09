export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  stock: number;
  imageUrl: string;
};

export type CartItem = Product & { quantity: number };

export const fallbackImage =
  "https://images.unsplash.com/photo-1614213812711-26ae849ce5da?auto=format&fit=crop&w=1400&q=85";

export const toNumber = (value: number | string | null | undefined) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(toNumber(value));

export const normalizeProduct = (product: Record<string, unknown>): Product => {
  const price = toNumber(product.price as number | string | undefined);
  const promoPrice = toNumber(
    product.promoPrice as number | string | undefined,
  );

  return {
    id: String(product.id),
    name: String(product.name ?? ""),
    description: String(product.description ?? ""),
    price,
    promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : undefined,
    stock: toNumber(product.stock as number | string | undefined),
    imageUrl: String(product.imageUrl ?? product.image_url ?? ""),
  };
};

export const readCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem("streetflow-cart");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    return parsed.map((item) => ({
      ...normalizeProduct(item as unknown as Record<string, unknown>),
      quantity: Math.max(1, toNumber(item.quantity)),
    }));
  } catch {
    localStorage.removeItem("streetflow-cart");
    return [];
  }
};

export const writeCart = (cart: CartItem[]) => {
  localStorage.setItem("streetflow-cart", JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("streetflow:cart", { detail: cart }));
};
