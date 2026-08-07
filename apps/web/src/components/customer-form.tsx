"use client";

import { useActionState } from "react";

type CustomerFormProps = {
  action: (formData: FormData) => Promise<unknown>;
};

export function CustomerForm({ action }: CustomerFormProps) {
  const [state, formAction] = useActionState(async (_prev: unknown, formData: FormData) => {
    await action(formData);
    return { ok: true };
  }, null);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-2">
      <input
        name="name"
        placeholder="Customer name"
        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
      />
      <input
        name="email"
        type="email"
        placeholder="customer@company.com"
        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
      />
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Create customer
        </button>
      </div>
      {state ? <p className="md:col-span-2 text-sm text-emerald-400">Customer submitted.</p> : null}
    </form>
  );
}
