import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import { FormularioVoto } from "@/components/FormularioVoto";
import { estimativaPorAdulto, obterAmigos, obterCasas, obterViagem, resumirPresenca } from "@/lib/dados";
import { dataLonga, pluralizar, reais, textoPrazo } from "@/lib/formato";
import { montarPessoas } from "@/lib/rateio";
import { idDoParticipante } from "@/lib/sessao";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="selo bg-mar-50 text-mar-700 ring-1 ring-mar-100">{children}</span>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-areia-100/80 px-3 py-2">
      <p className="text-[11px] text-oceano-800/60">{rotulo}</p>
      <p className="text-sm font-semibold text-oceano-900">{valor}</p>
    </div>
  );
}

function FotoCasa({ fotoUrl, nome }: { fotoUrl: string; nome: string }) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fotoUrl} alt={`Foto da ${nome}`} className="h-48 w-full object-cover sm:h-56" />
    );
  }

  return (
    <div className="flex h-32 w-full items-end justify-center bg-gradient-to-br from-mar-300 via-mar-500 to-oceano-700 sm:h-40">
      <svg viewBox="0 0 1200 60" className="h-8 w-full text-white/80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40c150-26 300 26 450 0s300-26 450 0 200 22 300 4v16H0z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default async function PaginaCasas() {
  const viagem = await obterViagem();
  const [casas, amigos, meuId] = await Promise.all([
    obterCasas(viagem.rodadaVotacao),
    obterAmigos(),
    idDoParticipante(),
  ]);

  const resumo = resumirPresenca(amigos, viagem.metaPessoas);
  const cotasConfirmadas = montarPessoas(amigos, viagem).reduce((soma, pessoa) => soma + pessoa.cota, 0);
  const totalVotos = casas.reduce((soma, casa) => soma + casa.votos.length, 0);
  const eu = amigos.find((amigo) => amigo.id === meuId) ?? null;
  const meuVotoAtual = casas.flatMap((casa) => casa.votos).find((voto) => voto.amigoId === meuId) ?? null;

  const bloqueio = !eu
    ? "Para votar, clique na sua foto na página de presença."
    : !viagem.votacaoAberta
      ? "A votação está encerrada."
      : null;

  return (
    <div className="space-y-5">
      <section className="cartao">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Votação das casas</h1>
            <p className="mt-1 text-sm text-oceano-800/75">
              Rodada {viagem.rodadaVotacao} · cada pessoa vota uma vez e pode trocar o voto até o prazo.
            </p>
          </div>
          <span
            className={`selo ${
              viagem.votacaoAberta ? "bg-folha-100 text-folha-600" : "bg-coral-100 text-coral-600"
            }`}
          >
            {viagem.votacaoAberta ? "Votação aberta" : "Votação encerrada"}
          </span>
        </div>

        <p className="mt-3 text-sm text-oceano-800/80">
          Prazo: {dataLonga(viagem.prazoVotacao)} ({textoPrazo(viagem.prazoVotacao)}) ·{" "}
          {pluralizar(totalVotos, "voto registrado", "votos registrados")} · teto de{" "}
          {reais(viagem.orcamentoMaximo)} para a casa · grupo estimado em {viagem.minPessoas} a{" "}
          {viagem.metaPessoas} pessoas ({resumo.confirmados} confirmadas).
        </p>

        {!eu && (
          <p className="mt-3 rounded-2xl bg-sol-100 px-4 py-3 text-sm text-oceano-800">
            Você ainda não se identificou.{" "}
            <Link href="/presenca" className="font-semibold underline decoration-dotted">
              Clique na sua foto
            </Link>{" "}
            para liberar o voto.
          </p>
        )}

        {eu && meuVotoAtual && (
          <p className="mt-3 rounded-2xl bg-mar-50 px-4 py-3 text-sm text-oceano-800">
            Seu voto está registrado em{" "}
            <strong>{casas.find((casa) => casa.id === meuVotoAtual.casaId)?.nome}</strong>. Pode trocar
            votando em outra casa.
          </p>
        )}
      </section>

      <ul className="space-y-5">
        {casas.map((casa) => {
          const escolhida = viagem.casaEscolhidaId === casa.id;
          const estimativa = estimativaPorAdulto(casa.valorTotal, cotasConfirmadas, viagem, casa.capacidade);
          const cabeGrupo = casa.capacidade >= viagem.minPessoas;
          const percentual = totalVotos > 0 ? Math.round((casa.votos.length / totalVotos) * 100) : 0;
          const meuVoto = meuVotoAtual?.casaId === casa.id;

          return (
            <li
              key={casa.id}
              className={`cartao overflow-hidden p-0 ${casa.indisponivel ? "opacity-70" : ""} ${
                escolhida ? "border-folha-500/60 ring-2 ring-folha-500/30" : ""
              }`}
            >
              <div className="relative">
                <FotoCasa fotoUrl={casa.fotoUrl} nome={casa.nome} />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {escolhida && <span className="selo bg-folha-500 text-white">Casa escolhida</span>}
                  {casa.indisponivel && <span className="selo bg-oceano-900/80 text-white">Indisponível</span>}
                  {!casa.indisponivel && (
                    <span className="selo bg-white/90 text-oceano-800">
                      {casa.votos.length === 0
                        ? "Sem votos"
                        : `${pluralizar(casa.votos.length, "voto", "votos")} · ${percentual}%`}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="font-display text-xl leading-tight">{casa.nome}</h2>
                  <p className="mt-1 text-sm text-oceano-800/70">
                    {casa.regiao}
                    {casa.distanciaPraia ? ` · ${casa.distanciaPraia}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    {casa.link && (
                      <a
                        href={casa.link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-mar-700 underline decoration-dotted"
                      >
                        Ver o anúncio
                      </a>
                    )}
                    {casa.notaAirbnb && (
                      <span className="text-oceano-800/75">
                        ★ {casa.notaAirbnb.toFixed(2)}
                        {casa.avaliacoes ? ` · ${pluralizar(casa.avaliacoes, "avaliação", "avaliações")}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {casa.indisponivel && casa.motivoIndisponivel && (
                  <p className="rounded-2xl bg-oceano-900/5 px-4 py-3 text-sm text-oceano-800">
                    {casa.motivoIndisponivel}
                  </p>
                )}

                {casa.alerta && (
                  <p className="rounded-2xl border border-coral-200 bg-coral-100/70 px-4 py-3 text-sm text-oceano-900">
                    <strong className="font-semibold">Atenção:</strong> {casa.alerta}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Dado
                    rotulo="Capacidade oficial"
                    valor={casa.capacidade > 0 ? `${casa.capacidade} hóspedes` : "a confirmar"}
                  />
                  <Dado rotulo="Quartos" valor={casa.quartos > 0 ? String(casa.quartos) : "—"} />
                  <Dado rotulo="Camas" valor={casa.camas > 0 ? String(casa.camas) : "a confirmar"} />
                  <Dado rotulo="Banheiros" valor={casa.banheiros > 0 ? String(casa.banheiros) : "—"} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {casa.piscina && <Chip>Piscina</Chip>}
                  {casa.churrasqueira && <Chip>Churrasqueira</Chip>}
                  {casa.arCondicionado && <Chip>Ar-condicionado</Chip>}
                  {casa.estacionamento && <Chip>Estacionamento</Chip>}
                  {casa.extras
                    .split(",")
                    .map((extra) => extra.trim())
                    .filter(Boolean)
                    .map((extra) => (
                      <Chip key={extra}>{extra}</Chip>
                    ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-mar-50 px-4 py-3">
                    <p className="text-xs text-oceano-800/65">Valor total com taxas</p>
                    <p className="font-display text-xl text-oceano-900">
                      {casa.valorTotal > 0 ? reais(casa.valorTotal) : "preço a confirmar"}
                    </p>
                    <p className="mt-0.5 text-xs text-oceano-800/65">
                      {casa.precoAConfirmar && casa.valorTotal > 0
                        ? "Cotação ainda não confirmada"
                        : casa.hospedesCotacao
                          ? `Cotação para ${casa.hospedesCotacao} hóspedes${
                              casa.cotacaoData ? ` · ${casa.cotacaoData.rotulo}` : ""
                            }`
                          : "Confirmar datas e taxas no anúncio"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-areia-100 px-4 py-3">
                    <p className="text-xs text-oceano-800/65">Estimativa por adulto</p>
                    <p className="font-display text-xl text-oceano-900">
                      {casa.valorTotal > 0 ? reais(estimativa.valor) : "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-oceano-800/65">
                      Dividido por {estimativa.cotas.toString().replace(".", ",")} cotas
                      {cotasConfirmadas > 0 ? " (confirmados)" : " (grupo estimado)"}
                    </p>
                  </div>
                </div>

                {casa.capacidade > 0 && (
                  <p
                    className={`text-sm ${cabeGrupo ? "text-folha-600" : "text-coral-600"} font-medium`}
                  >
                    {cabeGrupo
                      ? `Cabe o grupo: ${casa.capacidade} hóspedes para ${viagem.minPessoas}–${viagem.metaPessoas} pessoas.`
                      : `Só cabem ${casa.capacidade} pessoas: faltariam ${
                          viagem.minPessoas - casa.capacidade
                        } vagas para o grupo mínimo.`}
                  </p>
                )}

                {casa.custosObrigatorios && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-oceano-800/60 uppercase">
                      Custos obrigatórios fora da diária
                    </p>
                    <p className="text-sm text-oceano-800/85">{casa.custosObrigatorios}</p>
                  </div>
                )}

                {casa.regras && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-oceano-800/60 uppercase">
                      Regras relevantes
                    </p>
                    <p className="text-sm text-oceano-800/85">{casa.regras}</p>
                  </div>
                )}

                {casa.votos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-oceano-800/60 uppercase">
                      Quem votou
                    </p>
                    <ul className="mt-2 space-y-2">
                      {casa.votos.map((voto) => (
                        <li key={voto.id} className="flex items-start gap-2.5">
                          <Avatar
                            nome={voto.amigo.nome}
                            sobrenome={voto.amigo.sobrenome}
                            fotoUrl={voto.amigo.fotoUrl}
                            tamanho="p"
                            className="h-8 w-8"
                          />
                          <p className="text-sm text-oceano-800/85">
                            <span className="font-medium text-oceano-900">{voto.amigo.nome}</span>
                            {voto.comentario && <span className="text-oceano-800/75"> — {voto.comentario}</span>}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!casa.indisponivel && (
                  <FormularioVoto
                    casaId={casa.id}
                    meuVoto={meuVoto}
                    comentarioAtual={meuVoto ? (meuVotoAtual?.comentario ?? "") : ""}
                    bloqueio={bloqueio}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-sm text-oceano-800/65">
        Só o organizador pode incluir, editar ou remover casas.{" "}
        <Link href="/organizador" className="underline decoration-dotted">
          Sugerir uma casa
        </Link>
      </p>
    </div>
  );
}
