"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Brand } from "@/components/brand";
import { buildApiUrl } from "@/config/environment";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/shop";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch(buildApiUrl("/store/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        id?: string;
        role?: string;
        name?: string;
      } | null;

      if (response.ok && data?.role) {
        localStorage.setItem(
          "streetflow-role",
          data.role === "ADMIN" ? "Admin" : "User",
        );
        localStorage.setItem("streetflow-user", data.name ?? email);
        localStorage.setItem("streetflow-user-id", data.id ?? "");
        router.push(redirectTo);
        return;
      }

      setError(
        "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      );
    } catch {
      setError("Não foi possível entrar agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-forest-950 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex min-h-screen flex-col bg-cream-50 p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-forest-950/55 hover:text-forest-950"
          >
            <ArrowLeft size={16} /> Loja
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-14">
          <p className="eyebrow text-coral-500">Bem-vindo de volta</p>
          <h1 className="font-display mt-4 text-5xl font-bold leading-[0.92] tracking-[-0.07em]">
            Entre no seu flow.
          </h1>
          <p className="mt-4 text-sm leading-6 text-forest-950/55">
            Acesse sua conta para finalizar pedidos e acompanhar suas próximas
            rotas.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 grid gap-5">
            <label className="field-label">
              E-mail
              <span className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-950/35"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="field pl-12"
                  placeholder="voce@email.com"
                />
              </span>
            </label>
            <label className="field-label">
              Senha
              <span className="relative">
                <LockKeyhole
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-950/35"
                  size={18}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="field px-12"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-950/40 hover:text-forest-950"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-coral-500/10 px-4 py-3 text-sm font-medium text-coral-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="button-primary mt-1 w-full disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}{" "}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-forest-950/10 bg-white/70 p-5 text-xs leading-6 text-forest-950/55">
            <p className="font-bold text-forest-950">Acesso de demonstração</p>
            <p className="mt-2">Admin: admin@streetflow.com · admin123</p>
            <p>Cliente: user@streetflow.com · user123</p>
          </div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_30%,rgba(201,248,90,.38),transparent_25%),radial-gradient(circle_at_28%_72%,rgba(241,91,63,.42),transparent_30%)]" />
        <div className="absolute left-[15%] top-[18%] size-64 rounded-full border-[46px] border-lime-300" />
        <div className="absolute bottom-[16%] right-[8%] size-80 rounded-full border-[58px] border-coral-500" />
        <div className="relative z-10 flex h-full items-end p-16 xl:p-20">
          <p className="font-display max-w-xl text-5xl font-bold leading-[0.95] tracking-[-0.065em] text-white xl:text-6xl">
            Toda rota fica melhor quando é sua.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <LoginContent />
    </Suspense>
  );
}
