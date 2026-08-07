type StatsPanelProps = {
  total: number;
};

export function StatsPanel({ total }: StatsPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live metrics</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold text-slate-100">{total}</p>
          <p className="text-sm text-slate-400">customers registered</p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
          healthy
        </div>
      </div>
    </div>
  );
}
