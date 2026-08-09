import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: {
    default: "Street Flow — A cidade no seu ritmo",
    template: "%s | Street Flow",
  },
  description:
    "Patins elétricos para uma mobilidade urbana mais livre, leve e divertida.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Street Flow — A cidade no seu ritmo",
    description:
      "Patins elétricos para uma mobilidade urbana mais livre, leve e divertida.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Street Flow — A cidade. Seu ritmo.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Street Flow — A cidade no seu ritmo",
    description:
      "Patins elétricos para uma mobilidade urbana mais livre, leve e divertida.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
