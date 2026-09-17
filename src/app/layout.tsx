import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import Link from "next/link";

import { Cabecalho } from "@/components/Cabecalho";
import { NavegacaoRodape } from "@/components/Navegacao";

import "./globals.css";

const titulo = Fraunces({
  variable: "--font-titulo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const corpo = Nunito_Sans({
  variable: "--font-corpo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Búzios em Família 2026",
  description:
    "Confirmação de presença, votação da casa, rateio transparente e controle de pagamentos da nossa viagem para Búzios em dezembro de 2026.",
};

export const viewport: Viewport = {
  themeColor: "#12a3a5",
};

// Todas as páginas leem o banco a cada acesso: nada de conteúdo congelado no build.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Cabecalho />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-5 pb-28 sm:pb-12">{children}</main>
        <footer className="mx-auto w-full max-w-4xl px-4 pb-28 text-center text-xs text-oceano-800/50 sm:pb-8">
          Feito para a família e os amigos ·{" "}
          <Link href="/organizador" className="underline decoration-dotted hover:text-mar-600">
            área do organizador
          </Link>
        </footer>
        <NavegacaoRodape />
      </body>
    </html>
  );
}
