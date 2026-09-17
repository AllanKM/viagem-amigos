import { garantirPrevia, siteDoLink, type CasaComPrevia } from "@/lib/previa";

type CasaDoCartao = CasaComPrevia & { nome: string; fotoUrl: string };

function Moldura({ children }: { children: React.ReactNode }) {
  return <div className="relative bg-areia-100">{children}</div>;
}

function SemFoto() {
  return (
    <div className="flex h-32 w-full items-end justify-center bg-gradient-to-br from-mar-300 via-mar-500 to-oceano-700 sm:h-40">
      <svg viewBox="0 0 1200 60" className="h-8 w-full text-white/80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40c150-26 300 26 450 0s300-26 450 0 200 22 300 4v16H0z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function EsqueletoPrevia() {
  return (
    <Moldura>
      <div className="h-52 w-full animate-pulse bg-areia-200 sm:h-64" />
      <div className="flex items-center gap-3 border-t border-areia-200 px-4 py-3">
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-areia-200" />
      </div>
    </Moldura>
  );
}

/**
 * Prévia do anúncio: foto, título e nota lidos do próprio link (Open Graph).
 * Sem link ou sem resposta do site, mostra a foto cadastrada à mão.
 */
export async function PreviaAnuncio({ casa }: { casa: CasaDoCartao }) {
  const previa = await garantirPrevia(casa);
  const imagem = casa.fotoUrl || previa?.imagem || "";
  const site = previa?.site || siteDoLink(casa.link);
  // No Airbnb o nome do anúncio vem na descrição; em outros sites, no título.
  const curto = previa?.resumo && previa.resumo.length <= 90 ? previa.resumo : "";
  const chamada = curto || previa?.titulo || casa.nome;
  const detalhe = chamada === previa?.titulo ? (previa?.resumo ?? "") : (previa?.titulo ?? "");

  return (
    <Moldura>
      {imagem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagem}
          alt={`Foto do anúncio da ${casa.nome}`}
          className="h-52 w-full object-cover sm:h-64"
        />
      ) : (
        <SemFoto />
      )}

      {casa.link && (
        <a
          href={casa.link}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 border-t border-areia-200 bg-white/70 px-4 py-3 transition hover:bg-white"
        >
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-oceano-800/55 uppercase">
              {site || "anúncio"}
              {previa?.nota && (
                <span className="text-sol-500 normal-case">★ {previa.nota.toFixed(2).replace(".", ",")}</span>
              )}
            </p>
            <p className="truncate text-sm font-medium text-oceano-900">{chamada}</p>
            {detalhe && <p className="line-clamp-2 text-xs text-oceano-800/70">{detalhe}</p>}
          </div>
          <span className="selo shrink-0 bg-mar-50 text-mar-700 ring-1 ring-mar-100">
            abrir
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      )}
    </Moldura>
  );
}
