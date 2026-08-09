import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="bg-forest-950 text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <Brand inverse />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Mobilidade elétrica compacta para quem prefere viver a cidade no
            próprio ritmo.
          </p>
        </div>
        <div>
          <p className="eyebrow text-lime-300">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <Link href="/shop" className="hover:text-white">
              Todos os patins
            </Link>
            <Link href="/cart" className="hover:text-white">
              Minha sacola
            </Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-lime-300">Atendimento</p>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Segunda a sexta
            <br />
            9h às 18h
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© 2026 Street Flow</span>
          <span>Feito para mover diferente.</span>
        </div>
      </div>
    </footer>
  );
}
