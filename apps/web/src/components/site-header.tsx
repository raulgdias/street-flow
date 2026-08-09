"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import type { CartItem } from "@/lib/store";
import { readCart } from "@/lib/store";

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [role, setRole] = useState<"Admin" | "User" | "Guest">("Guest");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateCart = (event?: Event) => {
      const customEvent = event as CustomEvent<CartItem[]> | undefined;
      const cart = customEvent?.detail ?? readCart();
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    };

    const updateRole = () => {
      const storedRole = localStorage.getItem("streetflow-role");
      setRole(
        storedRole === "Admin" || storedRole === "User" ? storedRole : "Guest",
      );
    };

    updateCart();
    updateRole();
    window.addEventListener("streetflow:cart", updateCart);
    window.addEventListener("storage", updateCart);
    window.addEventListener("storage", updateRole);

    return () => {
      window.removeEventListener("streetflow:cart", updateCart);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-forest-950/10 bg-cream-50/90 backdrop-blur-xl">
      <div className="container-shell flex h-[76px] items-center justify-between">
        <Brand />

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          <Link href="/shop" className="nav-link">
            Patins
          </Link>
          <Link href="/#tecnologia" className="nav-link">
            Tecnologia
          </Link>
          <Link href="/#seguranca" className="nav-link">
            Segurança
          </Link>
          {role === "Admin" && (
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="icon-button"
            aria-label={role === "Guest" ? "Entrar" : `Conta ${role}`}
          >
            <UserRound size={19} strokeWidth={2.2} />
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-forest-950 px-4 text-sm font-bold text-white transition hover:bg-forest-800"
          >
            <ShoppingBag size={18} strokeWidth={2.3} />
            <span className="hidden sm:inline">Sacola</span>
            <span className="grid min-w-5 place-items-center rounded-full bg-lime-300 px-1.5 py-0.5 text-[11px] text-forest-950">
              {cartCount}
            </span>
          </Link>
          <button
            className="icon-button md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="container-shell grid gap-1 border-t border-forest-950/10 py-4 md:hidden"
          aria-label="Navegação mobile"
        >
          <Link
            href="/shop"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Patins
          </Link>
          <Link
            href="/#tecnologia"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Tecnologia
          </Link>
          <Link
            href="/#seguranca"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Segurança
          </Link>
          {role === "Admin" && (
            <Link
              href="/admin"
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Painel admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
