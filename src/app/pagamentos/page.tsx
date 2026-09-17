import Link from "next/link";

import { BarraProgresso } from "@/components/BarraProgresso";
import { obterRateioAtual, obterSaldos } from "@/lib/dados";
import { dataCurta, dataLonga, reais, textoPrazo } from "@/lib/formato";

const SITUACOES: Record<string, { rotulo: string; classe: string }> = {
  QUITADO: { rotulo: "Quitado", classe: "bg-folha-100 text-folha-600" },
  SINAL_PAGO: { rotulo: "Sinal pago", classe: "bg-mar-100 text-mar-700" },
  PARCIAL: { rotulo: "Pagamento parcial", classe: "bg-sol-100 text-sol-500" },
  PENDENTE: { rotulo: "Pendente", classe: "bg-coral-100 text-coral-600" },
};

const TIPOS: Record<string, string> = { SINAL: "Sinal", SALDO: "Saldo", AJUSTE: "Ajuste" };

export default async function PaginaPagamentos() {
  const { viagem, rateio, casa } = await obterRateioAtual();
  const saldos = await obterSaldos(rateio);

  const totalPago = saldos.reduce((soma, linha) => soma + linha.pago, 0);
  const totalDevido = rateio.total;
  const pendentes = saldos.filter((linha) => linha.saldo > 0);

  return (
    <div className="space-y-5">
      <section className="cartao">
        <h1 className="font-display text-2xl">Pagamentos</h1>
        <p className="mt-1 text-sm text-oceano-800/75">
          O sinal é de {viagem.percentualSinal}% da parte de cada núcleo e garante a vaga. O saldo entra
          depois, antes da viagem.
        </p>

        {viagem.chavePix ? (
          <div className="mt-3 rounded-2xl bg-mar-50 px-4 py-3">
            <p className="text-xs text-oceano-800/65">Chave PIX para pagamento</p>
            <p className="font-mono text-sm font-semibold break-all text-oceano-900">{viagem.chavePix}</p>
            {viagem.nomeRecebedorPix && (
              <p className="mt-0.5 text-xs text-oceano-800/70">Em nome de {viagem.nomeRecebedorPix}</p>
            )}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-sol-100 px-4 py-3 text-sm text-oceano-800">
            O organizador ainda não cadastrou a chave PIX.
          </p>
        )}

        <p className="mt-3 text-sm text-oceano-800/80">
          Prazo do sinal: {dataLonga(viagem.prazoConfirmacao)} ({textoPrazo(viagem.prazoConfirmacao)}).
          {casa ? ` Base do cálculo: ${casa.nome}.` : " Nenhuma casa definida ainda."}
        </p>
      </section>

      <section className="cartao">
        <BarraProgresso
          valor={Math.round(totalPago)}
          meta={Math.max(1, Math.round(totalDevido))}
          rotulo={`${reais(totalPago)} recebidos de ${reais(totalDevido)}`}
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            { rotulo: "Total a receber", valor: reais(totalDevido) },
            { rotulo: "Já recebido", valor: reais(totalPago) },
            { rotulo: "Falta receber", valor: reais(Math.max(0, totalDevido - totalPago)) },
          ].map((item) => (
            <div key={item.rotulo} className="rounded-2xl bg-areia-100/80 px-4 py-3">
              <p className="text-xs text-oceano-800/65">{item.rotulo}</p>
              <p className="font-display text-lg text-oceano-900">{item.valor}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cartao">
        <h2 className="font-display text-xl">Situação por núcleo</h2>

        {saldos.length === 0 ? (
          <p className="mt-2 text-sm text-oceano-800/75">
            Nada para cobrar ainda. Assim que houver confirmações e uma casa definida, os valores aparecem
            aqui.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {saldos.map((linha) => {
              const situacao = SITUACOES[linha.situacao];
              return (
                <li key={linha.nucleoId} className="rounded-2xl border border-areia-200 bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-lg text-oceano-900">{linha.nucleoNome}</p>
                    <span className={`selo ${situacao.classe}`}>{situacao.rotulo}</span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    {[
                      { rotulo: "Valor total", valor: reais(linha.devido) },
                      { rotulo: `Sinal (${viagem.percentualSinal}%)`, valor: reais(linha.sinalNecessario) },
                      { rotulo: "Pago", valor: reais(linha.pago) },
                      {
                        rotulo: linha.saldo > 0 ? "Falta" : "Crédito",
                        valor: reais(Math.abs(linha.saldo)),
                      },
                    ].map((item) => (
                      <div key={item.rotulo} className="rounded-xl bg-areia-100/70 px-3 py-2">
                        <dt className="text-[11px] text-oceano-800/60">{item.rotulo}</dt>
                        <dd className="font-semibold text-oceano-900">{item.valor}</dd>
                      </div>
                    ))}
                  </dl>

                  {linha.pagamentos.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-oceano-800/80">
                      {linha.pagamentos.map((pagamento) => (
                        <li key={pagamento.id} className="flex flex-wrap justify-between gap-2">
                          <span>
                            {TIPOS[pagamento.tipo] ?? pagamento.tipo} · {pagamento.metodo} ·{" "}
                            {dataCurta(pagamento.pagoEm)}
                            {pagamento.observacao ? ` · ${pagamento.observacao}` : ""}
                          </span>
                          <span className="font-semibold text-folha-600">+ {reais(pagamento.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {pendentes.length > 0 && (
        <section className="cartao border-coral-200 bg-coral-100/50">
          <h2 className="font-display text-xl">Ainda faltam</h2>
          <ul className="mt-2 space-y-1 text-sm text-oceano-800/85">
            {pendentes.map((linha) => (
              <li key={linha.nucleoId} className="flex justify-between gap-3">
                <span>{linha.nucleoNome}</span>
                <span className="font-semibold">{reais(linha.saldo)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-sm text-oceano-800/65">
        Os pagamentos são lançados pelo organizador.{" "}
        <Link href="/organizador" className="underline decoration-dotted">
          Registrar um pagamento
        </Link>
      </p>
    </div>
  );
}
