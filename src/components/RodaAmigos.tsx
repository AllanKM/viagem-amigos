import Link from "next/link";

import { iniciais } from "@/lib/formato";

export type PessoaRoda = {
  id: string;
  nome: string;
  sobrenome: string;
  fotoUrl: string | null;
  status: string;
};

export type CasaRoda = {
  nome: string;
  regiao: string;
  fotoUrl: string;
};

type Vaga =
  | { chave: string; tipo: "pessoa"; pessoa: PessoaRoda }
  | { chave: string; tipo: "livre" }
  | { chave: string; tipo: "extras"; quantidade: number };

/** Mais gente do que isso deixaria os rostos pequenos demais para tocar no celular. */
const MAX_VAGAS = 24;

const ESTILO: Record<string, { anel: string; fundo: string }> = {
  CONFIRMADO: { anel: "ring-2 ring-white", fundo: "bg-mar-100 text-oceano-800" },
  TALVEZ: { anel: "ring-2 ring-sol-300", fundo: "bg-sol-100 text-oceano-800" },
  PENDENTE: { anel: "ring-2 ring-white/40", fundo: "bg-oceano-900/35 text-white/85" },
};

function montarVagas(pessoas: PessoaRoda[], meta: number): Vaga[] {
  const lugares = Math.min(Math.max(meta, 8), MAX_VAGAS);
  const visiveis = pessoas.slice(0, lugares);
  const vagas: Vaga[] = visiveis.map((pessoa) => ({ chave: pessoa.id, tipo: "pessoa", pessoa }));
  const sobrando = pessoas.length - visiveis.length;

  if (sobrando > 0) {
    // A última posição vira um contador para ninguém ficar de fora da conta.
    vagas[vagas.length - 1] = { chave: "extras", tipo: "extras", quantidade: sobrando + 1 };
    return vagas;
  }

  while (vagas.length < lugares) {
    vagas.push({ chave: `livre-${vagas.length}`, tipo: "livre" });
  }
  return vagas;
}

/** Meio passo de giro nos anéis pares deixa a base livre para o rótulo da casa. */
const giroDoAnel = (quantidade: number) => (quantidade % 2 === 0 ? 0.5 : 0);

/**
 * Divide as vagas em um ou dois anéis, com raio e tamanho em % do lado do quadro.
 * Os raios deixam uma folga abaixo de cada rosto para o nome caber sem encostar
 * no rosto de baixo.
 */
function distribuir(total: number) {
  if (total <= 14) return [{ quantidade: total, raio: 37, tamanho: 14, giro: giroDoAnel(total) }];
  const externo = Math.ceil(total * 0.62);
  const interno = total - externo;
  return [
    { quantidade: externo, raio: 41, tamanho: 12, giro: giroDoAnel(externo) },
    { quantidade: interno, raio: 22, tamanho: 11, giro: giroDoAnel(interno) },
  ];
}

/** Reparte as vagas entre os anéis já na ordem em que serão desenhadas. */
function montarAneis(vagas: Vaga[]) {
  let inicio = 0;
  return distribuir(vagas.length).map((anel) => {
    const fatia = vagas.slice(inicio, inicio + anel.quantidade);
    inicio += anel.quantidade;
    return { ...anel, vagas: fatia };
  });
}

function posicao(indice: number, quantidade: number, raio: number, giro: number) {
  const angulo = ((indice + giro) / quantidade) * Math.PI * 2 - Math.PI / 2;
  return {
    lugar: {
      left: `${50 + raio * Math.cos(angulo)}%`,
      top: `${50 + raio * Math.sin(angulo)}%`,
    },
    // Na metade de cima o nome vai acima do rosto: para baixo ele cairia sobre a casa.
    nomeAcima: Math.sin(angulo) < 0,
  };
}

function Rosto({ pessoa, nomeAcima }: { pessoa: PessoaRoda; nomeAcima: boolean }) {
  const estilo = ESTILO[pessoa.status] ?? ESTILO.PENDENTE;
  const nomeCompleto = `${pessoa.nome} ${pessoa.sobrenome}`.trim();
  const base = `flex h-full w-full items-center justify-center rounded-full ${estilo.anel} shadow-[0_8px_18px_-10px_rgba(8,37,46,0.9)]`;

  return (
    <Link
      href={`/presenca/${pessoa.id}`}
      title={nomeCompleto}
      className="block h-full w-full transition hover:scale-[1.08] focus-visible:scale-[1.08]"
    >
      {pessoa.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pessoa.fotoUrl} alt={nomeCompleto} className={`${base} object-cover`} />
      ) : (
        <span className={`${base} ${estilo.fundo} font-display text-xs sm:text-lg`}>
          <span className="sr-only">{nomeCompleto}</span>
          <span aria-hidden>{iniciais(pessoa.nome, pessoa.sobrenome)}</span>
        </span>
      )}
      {pessoa.status === "CONFIRMADO" && (
        <span
          className="absolute right-0 bottom-0 flex h-4 w-4 items-center justify-center rounded-full bg-folha-500 text-white ring-2 ring-white sm:h-5 sm:w-5"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <span
        className={`absolute left-1/2 w-[145%] -translate-x-1/2 truncate rounded-md bg-oceano-900/60 px-1 py-0.5 text-center text-[0.5rem] leading-tight font-semibold text-white backdrop-blur-[1px] sm:text-[0.68rem] ${
          nomeAcima ? "bottom-full mb-1" : "top-full mt-1"
        }`}
        aria-hidden
      >
        {nomeCompleto}
      </span>
    </Link>
  );
}

function VagaLivre() {
  return (
    <Link
      href="/presenca"
      title="Vaga livre — confirme sua presença"
      className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-white/50 bg-white/10 text-white/70 backdrop-blur-[1px] transition hover:border-white/80 hover:bg-white/25 hover:text-white"
    >
      <span className="sr-only">Vaga livre — confirmar presença</span>
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M12 6v12M6 12h12" strokeLinecap="round" />
      </svg>
    </Link>
  );
}

function CasaNoCentro({ casa, rotulo }: { casa: CasaRoda | null; rotulo: string }) {
  const conteudo = (
    <div className="relative aspect-square w-full overflow-hidden rounded-full border-[3px] border-white/90 shadow-[0_18px_40px_-18px_rgba(8,37,46,0.95)]">
      {casa?.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={casa.fotoUrl} alt={`Foto da ${casa.nome}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-mar-500 via-mar-600 to-oceano-800 text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 sm:h-12 sm:w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden
          >
            <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11v8h12v-8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19v-4.5h4V19" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: "29%" }}
    >
      <Link href="/casas" title={casa ? casa.nome : "Ver as casas candidatas"} className="block">
        {conteudo}
        <span className="absolute inset-x-0 -bottom-2 mx-auto w-fit rounded-full bg-oceano-900/85 px-2.5 py-1 text-center text-[0.6rem] font-semibold tracking-wide text-white uppercase ring-1 ring-white/30 sm:text-xs">
          {rotulo}
        </span>
      </Link>
    </div>
  );
}

/**
 * Roda da viagem: os rostos de quem vai em volta e a casa escolhida no meio.
 * As posições vêm de seno/cosseno em porcentagem, então o desenho acompanha
 * a largura da tela sem depender de JavaScript no navegador.
 */
export function RodaAmigos({
  pessoas,
  meta,
  casa,
  rotuloCasa,
}: {
  pessoas: PessoaRoda[];
  meta: number;
  casa: CasaRoda | null;
  rotuloCasa: string;
}) {
  const aneis = montarAneis(montarVagas(pessoas, meta));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[27rem] sm:max-w-[34rem] lg:max-w-[38rem]">
      {aneis.map((anel) => (
        <div
          key={`trilha-${anel.raio}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/30"
          style={{ width: `${anel.raio * 2}%`, height: `${anel.raio * 2}%` }}
          aria-hidden
        />
      ))}

      {aneis.flatMap((anel) =>
        anel.vagas.map((vaga, indice) => {
          const { lugar, nomeAcima } = posicao(indice, anel.quantidade, anel.raio, anel.giro);
          return (
          <div
            key={vaga.chave}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              ...lugar,
              width: `${anel.tamanho}%`,
              height: `${anel.tamanho}%`,
            }}
          >
            {vaga.tipo === "pessoa" ? (
              <Rosto pessoa={vaga.pessoa} nomeAcima={nomeAcima} />
            ) : vaga.tipo === "extras" ? (
              <Link
                href="/presenca"
                className="flex h-full w-full items-center justify-center rounded-full bg-white/85 font-display text-xs text-oceano-900 ring-2 ring-white sm:text-lg"
              >
                +{vaga.quantidade}
              </Link>
            ) : (
              <VagaLivre />
            )}
          </div>
          );
        }),
      )}

      <CasaNoCentro casa={casa} rotulo={rotuloCasa} />
    </div>
  );
}
