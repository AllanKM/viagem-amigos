import type { CustoExtra, Nucleo } from "@prisma/client";

import { excluirCusto, excluirPagamento, registrarPagamento, salvarCusto } from "@/actions/organizador";
import { BotaoAcao } from "@/components/BotaoAcao";
import { FormAcao } from "@/components/FormAcao";
import { dataCurta, paraInputDate, reais } from "@/lib/formato";
import type { SaldoNucleo } from "@/lib/dados";

export function SecaoCustos({ custos }: { custos: CustoExtra[] }) {
  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Custos extras</h2>
      <p className="mt-1 text-sm text-oceano-800/75">
        Entram no rateio junto com a casa: faxina, caseiro, consumo de água e luz, aluguel de berço. Viagem
        e transporte não devem ser lançados aqui.
      </p>

      <ul className="mt-3 space-y-2">
        {custos.map((custo) => (
          <li key={custo.id} className="rounded-2xl border border-areia-200 bg-white/70 p-3">
            <details>
              <summary className="flex cursor-pointer items-center justify-between gap-3">
                <span className="font-medium text-oceano-900">
                  {custo.descricao}
                  {!custo.incluirNoRateio && (
                    <span className="ml-2 selo bg-areia-200 text-oceano-700">fora do rateio</span>
                  )}
                </span>
                <span className="text-sm font-semibold text-oceano-900">{reais(custo.valor)}</span>
              </summary>

              <div className="mt-3 space-y-3">
                <FormAcao acao={salvarCusto} textoBotao="Salvar custo" estiloBotao="botao-suave">
                  <input type="hidden" name="id" value={custo.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="rotulo">Descrição</label>
                      <input name="descricao" defaultValue={custo.descricao} className="campo py-2.5" />
                    </div>
                    <div>
                      <label className="rotulo">Valor (R$)</label>
                      <input
                        name="valor"
                        type="number"
                        step="0.01"
                        defaultValue={custo.valor}
                        className="campo py-2.5"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-oceano-800">
                    <input
                      type="checkbox"
                      name="incluirNoRateio"
                      defaultChecked={custo.incluirNoRateio}
                      className="h-4 w-4 accent-mar-600"
                    />
                    Incluir no rateio
                  </label>
                </FormAcao>

                <form action={excluirCusto}>
                  <input type="hidden" name="id" value={custo.id} />
                  <BotaoAcao
                    className="text-sm font-medium text-coral-600 underline decoration-dotted"
                    confirmar="Remover este custo?"
                  >
                    Remover custo
                  </BotaoAcao>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <details className="mt-4 rounded-2xl bg-areia-100/70 p-3">
        <summary className="cursor-pointer font-medium text-oceano-900">+ Novo custo extra</summary>
        <FormAcao acao={salvarCusto} textoBotao="Adicionar custo" className="mt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="rotulo">Descrição</label>
              <input name="descricao" placeholder="Faxina final" className="campo py-2.5" />
            </div>
            <div>
              <label className="rotulo">Valor (R$)</label>
              <input name="valor" type="number" step="0.01" className="campo py-2.5" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-oceano-800">
            <input type="checkbox" name="incluirNoRateio" defaultChecked className="h-4 w-4 accent-mar-600" />
            Incluir no rateio
          </label>
        </FormAcao>
      </details>
    </section>
  );
}

export function SecaoPagamentos({
  nucleos,
  saldos,
}: {
  nucleos: Nucleo[];
  saldos: SaldoNucleo[];
}) {
  const hoje = paraInputDate(new Date());

  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Registrar pagamento</h2>

      <FormAcao acao={registrarPagamento} textoBotao="Registrar pagamento" className="mt-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="rotulo">Núcleo</label>
            <select name="nucleoId" className="campo py-2.5">
              <option value="">Escolha…</option>
              {nucleos.map((nucleo) => (
                <option key={nucleo.id} value={nucleo.id}>
                  {nucleo.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="rotulo">Valor (R$)</label>
            <input name="valor" type="number" step="0.01" className="campo py-2.5" />
          </div>
          <div>
            <label className="rotulo">Tipo</label>
            <select name="tipo" className="campo py-2.5">
              <option value="SINAL">Sinal</option>
              <option value="SALDO">Saldo</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="rotulo">Forma de pagamento</label>
            <input name="metodo" defaultValue="PIX" className="campo py-2.5" />
          </div>
          <div>
            <label className="rotulo">Data do pagamento</label>
            <input name="pagoEm" type="date" defaultValue={hoje} className="campo py-2.5" />
          </div>
          <div>
            <label className="rotulo">Observação</label>
            <input name="observacao" placeholder="Pago pelo Allan" className="campo py-2.5" />
          </div>
        </div>
      </FormAcao>

      <div className="mt-5">
        <h3 className="font-display text-lg">Lançamentos</h3>
        {saldos.every((linha) => linha.pagamentos.length === 0) ? (
          <p className="mt-1 text-sm text-oceano-800/70">Nenhum pagamento registrado ainda.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {saldos
              .filter((linha) => linha.pagamentos.length > 0)
              .map((linha) => (
                <li key={linha.nucleoId}>
                  <p className="text-sm font-semibold text-oceano-900">
                    {linha.nucleoNome} · pago {reais(linha.pago)} de {reais(linha.devido)}
                  </p>
                  <ul className="mt-1 divide-y divide-areia-200 overflow-hidden rounded-2xl border border-areia-200">
                    {linha.pagamentos.map((pagamento) => (
                      <li
                        key={pagamento.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-white/70 px-3 py-2 text-sm"
                      >
                        <span className="text-oceano-800/85">
                          {reais(pagamento.valor)} · {pagamento.tipo} · {pagamento.metodo} ·{" "}
                          {dataCurta(pagamento.pagoEm)}
                          {pagamento.observacao ? ` · ${pagamento.observacao}` : ""}
                        </span>
                        <form action={excluirPagamento}>
                          <input type="hidden" name="id" value={pagamento.id} />
                          <BotaoAcao
                            className="text-xs font-medium text-coral-600 underline decoration-dotted"
                            confirmar="Estornar este lançamento?"
                          >
                            estornar
                          </BotaoAcao>
                        </form>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}
