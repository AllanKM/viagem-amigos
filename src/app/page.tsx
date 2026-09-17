import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import { BarraProgresso } from "@/components/BarraProgresso";
import {
  obterAmigos,
  obterDatas,
  obterRanking,
  obterRateioAtual,
  resumirPresenca,
} from "@/lib/dados";
import { dataCurta, dataLonga, pluralizar, reais, reaisCurto, textoPrazo } from "@/lib/formato";

function Aviso({
  tom,
  titulo,
  children,
}: {
  tom: "atencao" | "info" | "bom";
  titulo: string;
  children: React.ReactNode;
}) {
  const estilos = {
    atencao: "border-coral-200 bg-coral-100/70",
    info: "border-mar-200 bg-mar-50",
    bom: "border-folha-500/30 bg-folha-100/70",
  }[tom];

  return (
    <li className={`rounded-2xl border ${estilos} px-4 py-3`}>
      <p className="text-sm font-semibold text-oceano-900">{titulo}</p>
      <p className="mt-0.5 text-sm text-oceano-800/80">{children}</p>
    </li>
  );
}

function Numero({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <div className="rounded-2xl border border-areia-200 bg-white/70 px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-oceano-800/60 uppercase">{titulo}</p>
      <p className="font-display text-xl text-oceano-900">{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-oceano-800/60">{detalhe}</p>}
    </div>
  );
}

export default async function PaginaInicial() {
  const [{ viagem, rateio, casa, origemCasa }, amigos, datas] = await Promise.all([
    obterRateioAtual(),
    obterAmigos(),
    obterDatas(),
  ]);
  const { itens: ranking, totalVotos } = await obterRanking(viagem.rodadaVotacao);

  const resumo = resumirPresenca(amigos, viagem.metaPessoas);
  const confirmados = amigos.filter((amigo) => amigo.status === "CONFIRMADO");
  const datasAtivas = datas.filter((data) => data.ativa);

  const preferencias = datasAtivas.map((data) => ({
    ...data,
    votos: amigos.filter(
      (amigo) => amigo.preferenciaDataId === data.id && amigo.status !== "NAO_VAI",
    ).length,
  }));

  const valorPorAdulto = rateio.valorPorCota;
  const acimaDoOrcamento = casa ? casa.valorTotal > viagem.orcamentoMaximo : false;
  const capacidadeInsuficiente = casa ? casa.capacidade > 0 && casa.capacidade < resumo.confirmados : false;

  return (
    <div className="space-y-5">
      <section className="cartao overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-mar-500 via-mar-600 to-oceano-800 px-5 pt-6 pb-8 text-white">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-mar-100 uppercase">
            {viagem.destino} · casa inteira com churrasqueira
          </p>
          <h1 className="mt-1.5 font-display text-3xl leading-tight sm:text-4xl">{viagem.nome}</h1>
          {viagem.descricao && (
            <p className="mt-2 max-w-xl text-sm text-white/85">{viagem.descricao}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {datasAtivas.map((data) => (
              <span
                key={data.id}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25"
              >
                {dataCurta(data.inicio)} → {dataCurta(data.fim)} · {pluralizar(data.noites, "noite", "noites")}
              </span>
            ))}
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25">
              Regiões: {viagem.regioesPreferidas}
            </span>
          </div>
          <svg
            className="absolute inset-x-0 bottom-0 h-6 w-full text-white/90"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0 26c120-22 240 22 360 0s240-22 360 0 240 22 480 0v14H0z" fill="currentColor" />
          </svg>
        </div>

        <div className="space-y-5 px-5 pt-4 pb-5">
          <BarraProgresso
            valor={resumo.confirmados}
            meta={viagem.metaPessoas}
            talvez={resumo.talvez}
            rotulo={`${resumo.confirmados} de ${viagem.metaPessoas} pessoas confirmadas`}
          />

          <div className="grid gap-2 sm:grid-cols-3">
            <Link href="/presenca" className="botao-coral w-full">
              Confirmar presença
            </Link>
            <Link href="/casas" className="botao-primario w-full">
              Ver casas
            </Link>
            <Link href="/rateio" className="botao-suave w-full">
              Ver rateio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Numero
          titulo="Confirmados"
          valor={`${resumo.confirmados} / ${viagem.metaPessoas}`}
          detalhe={`${resumo.adultosConfirmados} adultos e ${resumo.criancasConfirmadas} crianças`}
        />
        <Numero
          titulo="Orçamento da casa"
          valor={reaisCurto(viagem.orcamentoMaximo)}
          detalhe={casa ? `Casa atual: ${reaisCurto(casa.valorTotal)}` : "Nenhuma casa definida ainda"}
        />
        <Numero
          titulo="Estimativa por adulto"
          valor={valorPorAdulto > 0 ? reais(valorPorAdulto) : "a calcular"}
          detalhe={
            valorPorAdulto > 0
              ? `Crianças até ${viagem.idadeMeia} anos: ${reais(rateio.valorPorCotaMeia)}`
              : "Depende das confirmações e da casa"
          }
        />
        <Numero
          titulo="Prazo para responder"
          valor={dataLonga(viagem.prazoConfirmacao)}
          detalhe={textoPrazo(viagem.prazoConfirmacao)}
        />
      </section>

      <section className="cartao">
        <h2 className="font-display text-xl">Avisos importantes</h2>
        <ul className="mt-3 space-y-2">
          <Aviso tom={viagem.votacaoAberta ? "info" : "atencao"} titulo="Votação da casa">
            {viagem.votacaoAberta ? (
              <>
                Aberta até {dataLonga(viagem.prazoVotacao)} ({textoPrazo(viagem.prazoVotacao)}). Já são{" "}
                {pluralizar(totalVotos, "voto", "votos")} na rodada {viagem.rodadaVotacao}. Cada pessoa vota
                uma vez e pode trocar o voto até o prazo.
              </>
            ) : (
              <>Encerrada pelo organizador. Resultado na página das casas.</>
            )}
          </Aviso>

          <Aviso tom="atencao" titulo="A vaga só é garantida com o sinal">
            {viagem.avisoGeral ||
              `Reserve com o pagamento de ${viagem.percentualSinal}% do seu valor dentro do prazo.`}
          </Aviso>

          {valorPorAdulto > 0 && (
            <Aviso tom="info" titulo="Valor estimado hoje">
              {reais(valorPorAdulto)} por adulto, considerando {pluralizar(resumo.confirmados, "pessoa confirmada", "pessoas confirmadas")}
              {casa ? ` e a casa ${casa.nome}` : ""}. O valor cai conforme mais gente confirma. Viagem e
              transporte não entram no rateio.
            </Aviso>
          )}

          {acimaDoOrcamento && casa && (
            <Aviso tom="atencao" titulo="Atenção ao orçamento">
              A casa {casa.nome} custa {reais(casa.valorTotal)}, acima do teto de{" "}
              {reais(viagem.orcamentoMaximo)} combinado para a hospedagem.
            </Aviso>
          )}

          {capacidadeInsuficiente && casa && (
            <Aviso tom="atencao" titulo="Capacidade apertada">
              {casa.nome} aceita {casa.capacidade} hóspedes e já temos {resumo.confirmados} confirmados.
              Vale considerar outra casa ou uma segunda casa.
            </Aviso>
          )}

          {resumo.pendentes > 0 && (
            <Aviso tom="info" titulo="Ainda faltam respostas">
              {pluralizar(resumo.pendentes, "pessoa da lista ainda não respondeu", "pessoas da lista ainda não responderam")}.{" "}
              <Link href="/presenca" className="font-semibold text-mar-700 underline decoration-dotted">
                Ver quem falta
              </Link>
            </Aviso>
          )}

          {origemCasa === "ESCOLHIDA" && casa && (
            <Aviso tom="bom" titulo="Casa definida">
              Fechamos com {casa.nome} ({casa.regiao}). O rateio já usa esse valor.
            </Aviso>
          )}
        </ul>
      </section>

      {preferencias.length > 0 && (
        <section className="cartao">
          <h2 className="font-display text-xl">Preferência de datas</h2>
          <p className="mt-1 text-sm text-oceano-800/70">
            Como cada pessoa respondeu na confirmação de presença.
          </p>
          <ul className="mt-3 space-y-3">
            {preferencias.map((data) => (
              <li key={data.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-oceano-900">{data.rotulo}</span>
                  <span className="text-oceano-800/70">{pluralizar(data.votos, "pessoa", "pessoas")}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-areia-200">
                  <div
                    className="h-full rounded-full bg-mar-400"
                    style={{
                      width: `${
                        resumo.confirmados + resumo.talvez > 0
                          ? Math.min(100, (data.votos / (resumo.confirmados + resumo.talvez)) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ranking.some((item) => item.votos > 0) && (
        <section className="cartao">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Como está a votação</h2>
            <Link href="/casas" className="text-sm font-semibold text-mar-700 underline decoration-dotted">
              votar
            </Link>
          </div>
          <ol className="mt-3 space-y-2">
            {ranking
              .filter((item) => item.votos > 0)
              .map((item, indice) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mar-100 font-display text-sm text-mar-700">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-oceano-900">{item.nome}</span>
                  <span className="text-oceano-800/70">
                    {pluralizar(item.votos, "voto", "votos")} · {item.percentual}%
                  </span>
                </li>
              ))}
          </ol>
        </section>
      )}

      {confirmados.length > 0 && (
        <section className="cartao">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Já estão dentro</h2>
            <Link href="/presenca" className="text-sm font-semibold text-mar-700 underline decoration-dotted">
              ver todos
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {confirmados.slice(0, 18).map((amigo) => (
              <div key={amigo.id} className="flex w-16 flex-col items-center gap-1 text-center">
                <Avatar nome={amigo.nome} sobrenome={amigo.sobrenome} fotoUrl={amigo.fotoUrl} tamanho="p" />
                <span className="w-full truncate text-[11px] text-oceano-800/75">{amigo.nome}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
