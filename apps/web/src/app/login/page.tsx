"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/shop';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const response = await fetch('http://localhost:3000/store/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data?.role) {
      localStorage.setItem('streetflow-role', data.role === 'ADMIN' ? 'Admin' : 'User');
      localStorage.setItem('streetflow-user', data.name ?? email);
      router.push(redirectTo);
      return;
    }

    alert('Credenciais inválidas. Use admin@streetflow.com / admin123 ou user@streetflow.com / user123.');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">Login</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Entre para concluir a compra</h1>
          <p className="mt-2 text-slate-600">O catálogo continua livre; a autenticação é exigida só no fechamento do pedido.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <input name="email" className="rounded-xl border border-slate-300 bg-white px-4 py-3" placeholder="E-mail" />
          <input name="password" type="password" className="rounded-xl border border-slate-300 bg-white px-4 py-3" placeholder="Senha" />
          <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white">Entrar</button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Credenciais de teste</p>
          <ul className="mt-2 space-y-1">
            <li>Admin: admin@streetflow.com / admin123</li>
            <li>User: user@streetflow.com / user123</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-10 text-slate-700">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
