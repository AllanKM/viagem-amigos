import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import { NavegacaoTopo } from "@/components/Navegacao";
import { primeiroNome } from "@/lib/formato";
import { prisma } from "@/lib/prisma";
import { ehOrganizador, idDoParticipante } from "@/lib/sessao";

function Logo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sol-300 via-coral-400 to-mar-500 shadow-[0_10px_20px_-12px_rgba(8,37,46,0.8)]">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" aria-hidden>
        <circle cx="12" cy="9" r="3.4" fill="currentColor" opacity="0.95" />
        <path
          d="M2.5 16.5c2-1.6 3.6-1.6 5.6 0s3.6 1.6 5.6 0 3.6-1.6 5.6 0M2.5 20c2-1.6 3.6-1.6 5.6 0s3.6 1.6 5.6 0 3.6-1.6 5.6 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

async function IdentidadeChip() {
  const [meuId, organizador] = await Promise.all([idDoParticipante(), ehOrganizador()]);
  const eu = meuId ? await prisma.amigo.findUnique({ where: { id: meuId } }) : null;

  if (!eu) {
    return (
      <Link
        href="/presenca"
        className="selo border border-areia-300 bg-white text-oceano-800 hover:border-mar-300 hover:text-mar-700"
      >
        Quem é você?
      </Link>
    );
  }

  return (
    <Link
      href={organizador ? "/organizador" : `/presenca/${eu.id}`}
      className="flex items-center gap-2 rounded-full border border-areia-300 bg-white py-1 pl-1 pr-3 text-sm font-medium text-oceano-800 transition hover:border-mar-300 hover:text-mar-700"
    >
      <Avatar nome={eu.nome} sobrenome={eu.sobrenome} fotoUrl={eu.fotoUrl} tamanho="p" className="h-8 w-8" />
      <span className="max-w-24 truncate">{primeiroNome(eu.nome)}</span>
      {organizador && <span className="text-xs text-mar-600">organizador</span>}
    </Link>
  );
}

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 border-b border-areia-200/70 bg-areia-50/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-oceano-900">
              Búzios em Família
            </span>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-mar-600">
              DEZEMBRO 2026
            </span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <NavegacaoTopo />
          <IdentidadeChip />
        </div>
      </div>
    </header>
  );
}
