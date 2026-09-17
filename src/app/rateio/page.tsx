import Link from "next/link";

import { obterCasas, obterRateioAtual, obterViagem } from "@/lib/dados";
import { pluralizar, reais } from "@/lib/formato";

const cotaFormatada = (cotas: number) =>
  cotas.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export default async function PaginaRateio() {
  const viagem = await obterViagem();
  const [{ rateio, casa, origemCasa }, casas] = await Promise.all([
    obterRateioAtual(),
    obterCasas(viagem.rodadaVotacao),
  ]);

  const semCasa = !casa;
  const acimaDoOrcamento = casa ? casa.valorTotal > viagem.orcamentoMaximo : false;

  return (
    <div className="space-y-5">
      <section className="cartao">
        <h1 className="font-display text-2xl">Rateio da hospedagem</h1>
        <p className="mt-1 text-sm text-oceano-800/75">
          Contas abertas: tudo que entra na divisão está listado aqui. Viagem e transporte ficam por conta
          de cada um e não entram no rateio.
        </p>

        <ul className="mt-3 space-y-1.5 text-sm text-oceano-800/85">
          <li>• Cada adulto paga uma cota inteira.</li>
          <li>• Crianças até {viagem.idadeIsenta} anos não pagam.</li>
          <li>
            • Crianças de {viagem.idadeIsenta + 1} a {viagem.idadeMeia} anos pagam{" "}
            {Math.round(viagem.fatorMeia * 100)}% da cota.
          </li>
          <li>• Somente quem está com presença confirmada entra na conta.</li>
        </ul>
      </section>

      {semCasa ? (
        <section className="cartao border-sol-300 bg-sol-100/70">
          <h2 className="font-display text-xl">Ainda não há casa para calcular</h2>
          <p className="mt-1 text-sm text-oceano-800/80">
            O rateio aparece assim que a votação tiver uma casa na frente ou o organizador definir a casa
            escolhida.{" "}
            <Link href="/casas" className="font-semibold underline decoration-dotted">
              Ver casas e votar
            </Link>
          </p>
        </section>
      ) : (
        <>
          <section className="cartao">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-oceano-800/60 uppercase">
                  {origemCasa === "ESCOLHIDA" ? "Casa escolhida" : "Casa líder da votação"}
                </p>
                <h2 className="font-display text-xl">{casa.nome}</h2>
                <p className="text-sm text-oceano-800/70">{casa.regiao}</p>
              </div>
              {casa.precoAConfirmar && (
                <span className="selo bg-sol-100 text-sol-500">preço a confirmar</span>
              )}
            </div>

            <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { rotulo: "Casa (com taxas)", valor: reais(rateio.valorCasa) },
                { rotulo: "Custos extras rateados", valor: reais(rateio.valorExtras) },
                { rotulo: "Total a dividir", valor: reais(rateio.total) },
                { rotulo: "Cotas", valor: cotaFormatada(rateio.cotas) },
              ].map((item) => (
                <div key={item.rotulo} className="rounded-2xl bg-areia-100/80 px-4 py-3">
                  <dt className="text-xs text-oceano-800/65">{item.rotulo}</dt>
                  <dd className="font-display text-lg text-oceano-900">{item.valor}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-mar-50 px-4 py-3">
                <p className="text-xs text-oceano-800/65">Por adulto</p>
                <p className="font-display text-2xl text-mar-700">{reais(rateio.valorPorCota)}</p>
              </div>
              <div className="rounded-2xl bg-mar-50 px-4 py-3">
                <p className="text-xs text-oceano-800/65">
                  Por criança de {viagem.idadeIsenta + 1} a {viagem.idadeMeia} anos
                </p>
                <p className="font-display text-2xl text-mar-700">{reais(rateio.valorPorCotaMeia)}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-oceano-800/75">
              Base do cálculo: {pluralizar(rateio.adultos, "adulto", "adultos")},{" "}
              {pluralizar(rateio.criancasMeia, "criança pagando meia", "crianças pagando meia")} e{" "}
              {pluralizar(rateio.criancasIsentas, "criança isenta", "crianças isentas")}.
            </p>

            {acimaDoOrcamento && (
              <p className="mt-3 rounded-2xl border border-coral-200 bg-coral-100/70 px-4 py-3 text-sm">
                Essa casa custa {reais(casa.valorTotal)} e passa do teto de {reais(viagem.orcamentoMaximo)}{" "}
                combinado para a hospedagem.
              </p>
            )}

            {rateio.cotas === 0 && (
              <p className="mt-3 rounded-2xl bg-sol-100 px-4 py-3 text-sm">
                Ninguém confirmou presença ainda, então o valor por pessoa aparece como zero.{" "}
                <Link href="/presenca" className="font-semibold underline decoration-dotted">
                  Confirmar presença
                </Link>
              </p>
            )}
          </section>

          {rateio.extras.length > 0 && (
            <section className="cartao">
              <h2 className="font-display text-xl">Custos extras</h2>
              <ul className="mt-3 divide-y divide-areia-200">
                {rateio.extras.map((extra) => (
                  <li key={extra.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-oceano-900">
                      {extra.descricao}
                      {!extra.incluirNoRateio && (
                        <span className="ml-2 selo bg-areia-200 text-oceano-700">fora do rateio</span>
                      )}
                    </span>
                    <span className="font-semibold text-oceano-900">{reais(extra.valor)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="cartao">
            <h2 className="font-display text-xl">Quanto cada núcleo paga</h2>
            {rateio.nucleos.length === 0 ? (
              <p className="mt-2 text-sm text-oceano-800/75">
                Nenhuma confirmação registrada até agora.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-md text-sm">
                  <thead>
                    <tr className="text-left text-xs tracking-wide text-oceano-800/60 uppercase">
                      <th className="pb-2">Núcleo</th>
                      <th className="pb-2">Pessoas</th>
                      <th className="pb-2 text-right">Cotas</th>
                      <th className="pb-2 text-right">Valor</th>
                      <th className="pb-2 text-right">Sinal ({rateio.percentualSinal}%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-areia-200">
                    {rateio.nucleos.map((linha) => (
                      <tr key={linha.nucleoId ?? linha.nucleoNome}>
                        <td className="py-2.5 pr-3 font-medium text-oceano-900">{linha.nucleoNome}</td>
                        <td className="py-2.5 pr-3 text-oceano-800/80">
                          {linha.adultos} ad.
                          {linha.criancasMeia > 0 && ` · ${linha.criancasMeia} meia`}
                          {linha.criancasIsentas > 0 && ` · ${linha.criancasIsentas} isenta`}
                        </td>
                        <td className="py-2.5 text-right text-oceano-800/80">{cotaFormatada(linha.cotas)}</td>
                        <td className="py-2.5 text-right font-semibold text-oceano-900">
                          {reais(linha.valor)}
                        </td>
                        <td className="py-2.5 text-right text-oceano-800/80">{reais(linha.sinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-areia-300 font-semibold text-oceano-900">
                      <td className="pt-2.5">Total</td>
                      <td className="pt-2.5 text-oceano-800/80">{rateio.pessoas} pessoas</td>
                      <td className="pt-2.5 text-right">{cotaFormatada(rateio.cotas)}</td>
                      <td className="pt-2.5 text-right">{reais(rateio.total)}</td>
                      <td className="pt-2.5 text-right">{reais(rateio.totalSinal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <p className="mt-3 text-sm text-oceano-800/70">
              Cada núcleo paga junto e o responsável se organiza com a família.{" "}
              <Link href="/pagamentos" className="font-semibold text-mar-700 underline decoration-dotted">
                Acompanhar pagamentos
              </Link>
            </p>
          </section>
        </>
      )}

      <section className="cartao">
        <h2 className="font-display text-xl">Simulação por casa</h2>
        <p className="mt-1 text-sm text-oceano-800/75">
          Quanto ficaria por adulto em cada opção, usando as mesmas{" "}
          {cotaFormatada(rateio.cotas || 0)} cotas e os custos extras atuais.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-md text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-oceano-800/60 uppercase">
                <th className="pb-2">Casa</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-right">Por adulto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-areia-200">
              {casas.map((opcao) => {
                const total = opcao.valorTotal + rateio.valorExtras;
                const cotasBase = rateio.cotas > 0 ? rateio.cotas : viagem.metaPessoas;
                return (
                  <tr key={opcao.id} className={opcao.indisponivel ? "opacity-60" : ""}>
                    <td className="py-2.5 pr-3">
                      <span className="font-medium text-oceano-900">{opcao.nome}</span>
                      {opcao.precoAConfirmar && (
                        <span className="ml-2 selo bg-sol-100 text-sol-500">a confirmar</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-oceano-800/80">
                      {opcao.valorTotal > 0 ? reais(total) : "—"}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-oceano-900">
                      {opcao.valorTotal > 0 ? reais(total / cotasBase) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
