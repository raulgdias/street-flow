import type { CustomerDto } from "@street-flow/contracts";

type CustomerCardProps = {
  customer: CustomerDto;
};

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm transition hover:border-cyan-500/40">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">{customer.name}</h3>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
          {customer.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{customer.email}</p>
      <p className="mt-4 text-xs text-slate-500">ID: {customer.id}</p>
    </div>
  );
}
