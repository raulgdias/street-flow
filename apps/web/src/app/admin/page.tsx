"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Box,
  Check,
  PackageOpen,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/brand";
import { buildApiUrl, normalizeImageUrl } from "@/config/environment";
import {
  fallbackImage,
  formatCurrency,
  normalizeProduct,
  type Product,
} from "@/lib/store";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  promoPrice: "",
  stock: "10",
  imageUrl: "",
};

type FormState = typeof emptyForm;

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl("/store/products"));
      if (!response.ok) throw new Error();
      const data = (await response.json()) as Record<string, unknown>[];
      setProducts(
        data.map((product) => ({
          ...normalizeProduct(product),
          imageUrl: normalizeImageUrl(
            String(product.imageUrl ?? product.image_url ?? ""),
          ),
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.toLocaleLowerCase("pt-BR").trim();
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      product.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    );
  }, [products, query]);

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0,
  );
  const updateField = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const flashMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2400);
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const url = editingId
      ? buildApiUrl(`/store/products/${editingId}`)
      : buildApiUrl("/store/products");
    const response = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim() || null,
      }),
    });

    if (response.ok) {
      const result = (await response.json()) as { id?: string };
      if (imageFile && result.id) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        await fetch(buildApiUrl(`/store/products/${result.id}/image`), {
          method: "POST",
          body: uploadData,
        });
      }
      flashMessage(editingId ? "Produto atualizado" : "Produto adicionado");
      resetForm();
      await loadProducts();
    } else {
      flashMessage("Não foi possível salvar o produto");
    }
    setSaving(false);
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      promoPrice: product.promoPrice ? String(product.promoPrice) : "",
      stock: String(product.stock),
      imageUrl: product.imageUrl,
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Excluir “${product.name}” do catálogo?`)) return;
    const response = await fetch(buildApiUrl(`/store/products/${product.id}`), {
      method: "DELETE",
    });
    if (response.ok) {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      if (editingId === product.id) resetForm();
      flashMessage("Produto excluído");
    }
  };

  return (
    <main className="min-h-screen bg-cream-50">
      <header className="border-b border-forest-950/10 bg-white/70 backdrop-blur-xl">
        <div className="container-shell flex h-[76px] items-center justify-between">
          <Brand />
          <Link href="/shop" className="button-secondary min-h-10 px-4">
            <ArrowLeft size={16} /> Ver loja
          </Link>
        </div>
      </header>

      <div className="container-shell py-10 md:py-14">
        <div className="flex flex-col gap-6 border-b border-forest-950/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-coral-500">Painel administrativo</p>
            <h1 className="font-display mt-3 text-5xl font-bold tracking-[-0.07em] md:text-6xl">
              Catálogo.
            </h1>
            <p className="mt-3 text-sm text-forest-950/55">
              Produtos, preços e estoque em um só lugar.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white px-5 py-4">
              <p className="eyebrow text-forest-950/40">Produtos</p>
              <p className="font-display mt-1 text-2xl font-bold">
                {products.length}
              </p>
            </div>
            <div className="rounded-2xl bg-lime-300 px-5 py-4">
              <p className="eyebrow text-forest-950/55">Em estoque</p>
              <p className="font-display mt-1 text-2xl font-bold">
                {totalStock}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-full bg-forest-950 px-5 py-3 text-sm font-bold text-white shadow-xl">
            <Check size={17} className="text-lime-300" /> {message}
          </div>
        )}

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.75fr_1.25fr] xl:items-start">
          <section className="paper-card p-6 md:p-8 xl:sticky xl:top-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-coral-500">
                  {editingId ? "Editando" : "Novo item"}
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-[-0.04em]">
                  {editingId ? "Atualizar produto" : "Adicionar produto"}
                </h2>
              </div>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="icon-button"
                  aria-label="Cancelar edição"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={saveProduct} className="mt-7 grid gap-5">
              <label className="field-label">
                Nome do produto
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="field"
                  placeholder="Ex.: Street Flow One"
                />
              </label>
              <label className="field-label">
                Descrição
                <textarea
                  required
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="field min-h-28 resize-y"
                  placeholder="Conte o que torna este modelo especial"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">
                  Preço
                  <input
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    className="field"
                    placeholder="0,00"
                  />
                </label>
                <label className="field-label">
                  Preço promocional
                  <input
                    min="0.01"
                    step="0.01"
                    type="number"
                    value={form.promoPrice}
                    onChange={(event) =>
                      updateField("promoPrice", event.target.value)
                    }
                    className="field"
                    placeholder="Opcional"
                  />
                </label>
              </div>
              <label className="field-label">
                Estoque
                <input
                  required
                  min="0"
                  step="1"
                  type="number"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  className="field"
                />
              </label>
              <label className="field-label">
                URL da imagem
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    updateField("imageUrl", event.target.value)
                  }
                  className="field"
                  placeholder="https://..."
                />
              </label>

              <div className="rounded-2xl border border-dashed border-forest-950/20 bg-cream-50 p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
                  <span className="grid size-10 place-items-center rounded-full bg-white">
                    <Upload size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">
                      {imageFile?.name ?? "Ou envie um arquivo"}
                    </span>
                    <span className="text-xs font-medium text-forest-950/45">
                      PNG ou JPG
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {(form.imageUrl || imageFile) && (
                <div className="flex items-center gap-3 rounded-2xl bg-cream-100 p-3">
                  <div
                    className="size-14 rounded-xl bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${imageFile ? URL.createObjectURL(imageFile) : form.imageUrl})`,
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold">Prévia da imagem</p>
                    <p className="text-xs text-forest-950/45">
                      Confira antes de publicar
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="button-primary mt-1 w-full disabled:opacity-55"
              >
                {editingId ? <Save size={17} /> : <Plus size={17} />}
                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Salvar alterações"
                    : "Adicionar ao catálogo"}
              </button>
            </form>
          </section>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow text-forest-950/40">Inventário</p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-[-0.04em]">
                  Produtos publicados
                </h2>
              </div>
              <label className="relative sm:w-64">
                <span className="sr-only">Buscar no catálogo</span>
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-950/35"
                  size={17}
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="field h-11 min-h-11 pl-11"
                  placeholder="Buscar produto"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-2xl bg-cream-100"
                  />
                ))
              ) : visibleProducts.length === 0 ? (
                <div className="paper-card grid min-h-64 place-items-center p-8 text-center">
                  <div>
                    <PackageOpen
                      className="mx-auto text-forest-950/35"
                      size={34}
                    />
                    <p className="font-display mt-4 text-xl font-bold">
                      Nenhum produto por aqui.
                    </p>
                    <p className="mt-2 text-sm text-forest-950/50">
                      Adicione o primeiro item ao catálogo.
                    </p>
                  </div>
                </div>
              ) : (
                visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className="grid gap-4 rounded-2xl border border-forest-950/10 bg-white p-4 sm:grid-cols-[92px_1fr_auto] sm:items-center"
                  >
                    <div
                      className="aspect-square rounded-xl bg-cream-100 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${product.imageUrl || fallbackImage})`,
                      }}
                      role="img"
                      aria-label={product.name}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-bold tracking-[-0.035em]">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs text-forest-950/45">
                        {product.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
                        <span>
                          {formatCurrency(product.promoPrice ?? product.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-forest-950/45">
                          <Box size={13} /> {product.stock} un.
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <button
                        onClick={() => editProduct(product)}
                        className="icon-button size-10"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void deleteProduct(product)}
                        className="icon-button size-10 text-coral-600"
                        aria-label={`Excluir ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
