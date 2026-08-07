"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  stock: number;
  imageUrl?: string;
};

const toNumber = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number | string | null | undefined) => toNumber(value).toFixed(2);

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);

  const loadProducts = async () => {
    const response = await fetch('http://localhost:3000/store/products');
    const data = await response.json();
    setProducts(
      data.map((product: any) => {
        const price = toNumber(product.price);
        const promoPrice = toNumber(product.promoPrice);
        return {
          ...product,
          price,
          promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : undefined,
          stock: toNumber(product.stock),
        };
      }),
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setPromoPrice('');
    setStock('10');
    setImageUrl('');
    setImageFile(null);
    setImageInputKey((current) => current + 1);
  };

  const saveProduct = async () => {
    const payload = {
      name,
      description,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      stock: Number(stock),
      imageUrl: imageUrl || null,
    };

    const url = editingId ? `http://localhost:3000/store/products/${editingId}` : 'http://localhost:3000/store/products';
    const method = editingId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      if (imageFile && result?.id) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        await fetch(`http://localhost:3000/store/products/${result.id}/image`, {
          method: 'POST',
          body: uploadData,
        });
      }

      alert(editingId ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso');
      resetForm();
      loadProducts();
    }
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setPromoPrice(product.promoPrice ? String(product.promoPrice) : '');
    setStock(String(product.stock));
    setImageUrl(product.imageUrl ?? '');
    setImageFile(null);
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Painel administrativo</h1>
            <p className="mt-2 text-slate-600">Gerencie itens, preços e promoções do catálogo.</p>
          </div>
          <Link href="/shop" className="mt-2 inline-flex rounded-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:mt-0">
            Voltar para a Home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Editar produto' : 'Adicionar produto'}</h2>
            <div className="mt-4 space-y-3">
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Nome" />
              <input value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Descrição" />
              <input value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Valor" />
              <input value={promoPrice} onChange={(event) => setPromoPrice(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Promoção" />
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Imagem (URL)" />
              <input
                key={imageInputKey}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) {
                    setImageUrl(URL.createObjectURL(file));
                  }
                }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
              />
              <input value={stock} onChange={(event) => setStock(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Estoque" />
              <button onClick={saveProduct} className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white">{editingId ? 'Atualizar produto' : 'Salvar produto'}</button>
              {editingId ? (
                <button onClick={cancelEdit} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Cancelar edição</button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Produtos atuais</h2>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-right text-sm text-slate-600">
                      <p>R$ {formatCurrency(product.price)}</p>
                      {product.promoPrice ? <p className="text-cyan-700">Promo R$ {formatCurrency(product.promoPrice)}</p> : null}
                      <button onClick={() => editProduct(product)} className="rounded-full bg-cyan-600 px-3 py-2 text-white">Editar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
