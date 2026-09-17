"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", rotulo: "Início", icone: "casa" },
  { href: "/presenca", rotulo: "Presença", icone: "pessoas" },
  { href: "/casas", rotulo: "Casas", icone: "chave" },
  { href: "/rateio", rotulo: "Rateio", icone: "calculadora" },
  { href: "/pagamentos", rotulo: "Pagamentos", icone: "recibo" },
] as const;

function Icone({ nome }: { nome: (typeof ITENS)[number]["icone"] }) {
  const comum = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...comum}>
      {nome === "casa" && <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />}
      {nome === "pessoas" && (
        <>
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3.5 20c.6-3.3 2.9-5.2 5.5-5.2s4.9 1.9 5.5 5.2" />
          <path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14.4c2 .7 3.3 2.5 3.7 5" />
        </>
      )}
      {nome === "chave" && (
        <>
          <circle cx="8.5" cy="8.5" r="4" />
          <path d="M11.4 11.4 20 20M16.5 15.5l-2 2M19 18l-1.6 1.6" />
        </>
      )}
      {nome === "calculadora" && (
        <>
          <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
          <path d="M8 8h8M8 12h2m3 0h3M8 16h2m3 0h3" />
        </>
      )}
      {nome === "recibo" && (
        <>
          <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
          <path d="M9.5 8.5h5M9.5 12.5h5" />
        </>
      )}
    </svg>
  );
}

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavegacaoTopo() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {ITENS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
            ativo(pathname, item.href)
              ? "bg-white text-mar-700 shadow-[0_8px_20px_-16px_rgba(8,37,46,0.9)]"
              : "text-oceano-800/70 hover:bg-white/60 hover:text-mar-700"
          }`}
        >
          {item.rotulo}
        </Link>
      ))}
    </nav>
  );
}

export function NavegacaoRodape() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-areia-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <ul className="mx-auto flex max-w-lg">
        {ITENS.map((item) => {
          const selecionado = ativo(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={selecionado ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  selecionado ? "text-mar-700" : "text-oceano-800/55"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                    selecionado ? "bg-mar-100" : "bg-transparent"
                  }`}
                >
                  <Icone nome={item.icone} />
                </span>
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
