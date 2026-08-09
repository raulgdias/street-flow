import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label="Street Flow — início"
    >
      <span
        className={`grid size-10 place-items-center rounded-full border-2 text-[11px] font-black tracking-[-0.08em] transition-transform group-hover:-rotate-6 ${
          inverse
            ? "border-lime-300 bg-lime-300 text-forest-950"
            : "border-forest-950 bg-lime-300 text-forest-950"
        }`}
      >
        SF
      </span>
      <span
        className={`font-display text-xl font-bold tracking-[-0.06em] ${inverse ? "text-white" : "text-forest-950"}`}
      >
        street<span className="text-coral-500">/</span>flow
      </span>
    </Link>
  );
}
