import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Street Flow",
  description: "E-commerce MVP de patins elétricos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
