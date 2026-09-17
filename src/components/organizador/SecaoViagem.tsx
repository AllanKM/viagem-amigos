import type { Casa, OpcaoData, Viagem } from "@prisma/client";

import {
  abrirNovaRodada,
  alternarVotacao,
  definirCasaEscolhida,
  excluirData,
  salvarData,
  salvarViagem,
} from "@/actions/organizador";
import { BotaoAcao } from "@/components/BotaoAcao";
import { FormAcao } from "@/components/FormAcao";
import { paraInputDate, pluralizar, reais } from "@/lib/formato";

function Campo({
  nome,
  rotulo,
  children,
  dica,
}: {
  nome: string;
  rotulo: string;
  children: React.ReactNode;
  dica?: string;
}) {
  return (
    <div>
      <label className="rotulo" htmlFor={nome}>
        {rotulo}
      </label>
      {children}
      {dica && <p className="mt-1 text-xs text-oceano-800/60">{dica}</p>}
    </div>
  );
}

export function SecaoVotacao({
  viagem,
  casas,
  totalVotos,
}: {
  viagem: Viagem;
  casas: Casa[];
  totalVotos: number;
}) {
  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Votação</h2>
      <p className="mt-1 text-sm text-oceano-800/75">
        Rodada {viagem.rodadaVotacao} · {pluralizar(totalVotos, "voto", "votos")} ·{" "}
        {viagem.votacaoAberta ? "aberta" : "encerrada"}. Uma nova rodada zera os votos anteriores sem
        apagar o histórico.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <form action={alternarVotacao}>
          <BotaoAcao
            className={viagem.votacaoAberta ? "botao-suave px-4 py-2 text-sm" : "botao-primario px-4 py-2 text-sm"}
            confirmar={
              viagem.votacaoAberta
                ? "Encerrar a votação? Ninguém mais consegue votar."
                : "Reabrir a votação para todos?"
            }
          >
            {viagem.votacaoAberta ? "Encerrar votação" : "Reabrir votação"}
          </BotaoAcao>
        </form>
        <form action={abrirNovaRodada}>
          <BotaoAcao
            className="botao-suave px-4 py-2 text-sm"
            confirmar="Abrir a rodada seguinte? Os votos atuais deixam de contar."
          >
            Abrir nova rodada
          </BotaoAcao>
        </form>
      </div>

      <form action={definirCasaEscolhida} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <label className="rotulo" htmlFor="casaEscolhida">
            Casa escolhida (usada no rateio)
          </label>
          <select
            id="casaEscolhida"
            name="id"
            defaultValue={viagem.casaEscolhidaId ?? ""}
            className="campo py-2.5"
          >
            <option value="">Usar a líder da votação</option>
            {casas.map((casa) => (
              <option key={casa.id} value={casa.id}>
                {casa.nome} {casa.valorTotal > 0 ? `· ${reais(casa.valorTotal)}` : ""}
              </option>
            ))}
          </select>
        </div>
        <BotaoAcao className="botao-primario px-4 py-2.5 text-sm">Definir</BotaoAcao>
      </form>
    </section>
  );
}

export function SecaoViagem({ viagem }: { viagem: Viagem }) {
  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Dados da viagem</h2>
      <FormAcao acao={salvarViagem} textoBotao="Salvar viagem" className="mt-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo nome="nome" rotulo="Nome da viagem">
            <input id="nome" name="nome" defaultValue={viagem.nome} className="campo py-2.5" />
          </Campo>
          <Campo nome="destino" rotulo="Destino">
            <input id="destino" name="destino" defaultValue={viagem.destino} className="campo py-2.5" />
          </Campo>
          <Campo nome="regioesPreferidas" rotulo="Regiões preferidas">
            <input
              id="regioesPreferidas"
              name="regioesPreferidas"
              defaultValue={viagem.regioesPreferidas}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="orcamentoMaximo" rotulo="Orçamento máximo da casa (R$)">
            <input
              id="orcamentoMaximo"
              name="orcamentoMaximo"
              type="number"
              step="0.01"
              defaultValue={viagem.orcamentoMaximo}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="minPessoas" rotulo="Grupo mínimo">
            <input
              id="minPessoas"
              name="minPessoas"
              type="number"
              defaultValue={viagem.minPessoas}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="metaPessoas" rotulo="Grupo máximo (meta da barra)">
            <input
              id="metaPessoas"
              name="metaPessoas"
              type="number"
              defaultValue={viagem.metaPessoas}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="prazoConfirmacao" rotulo="Prazo para confirmar presença">
            <input
              id="prazoConfirmacao"
              name="prazoConfirmacao"
              type="date"
              defaultValue={paraInputDate(viagem.prazoConfirmacao)}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="prazoVotacao" rotulo="Prazo da votação">
            <input
              id="prazoVotacao"
              name="prazoVotacao"
              type="date"
              defaultValue={paraInputDate(viagem.prazoVotacao)}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="idadeIsenta" rotulo="Crianças isentas até (anos)">
            <input
              id="idadeIsenta"
              name="idadeIsenta"
              type="number"
              defaultValue={viagem.idadeIsenta}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="idadeMeia" rotulo="Meia cota até (anos)">
            <input
              id="idadeMeia"
              name="idadeMeia"
              type="number"
              defaultValue={viagem.idadeMeia}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="fatorMeia" rotulo="Fator da meia cota" dica="0,5 significa metade do valor do adulto.">
            <input
              id="fatorMeia"
              name="fatorMeia"
              type="number"
              step="0.05"
              min="0"
              max="1"
              defaultValue={viagem.fatorMeia}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="percentualSinal" rotulo="Percentual do sinal (%)">
            <input
              id="percentualSinal"
              name="percentualSinal"
              type="number"
              min="0"
              max="100"
              defaultValue={viagem.percentualSinal}
              className="campo py-2.5"
            />
          </Campo>
          <Campo nome="chavePix" rotulo="Chave PIX">
            <input id="chavePix" name="chavePix" defaultValue={viagem.chavePix} className="campo py-2.5" />
          </Campo>
          <Campo nome="nomeRecebedorPix" rotulo="Nome do recebedor">
            <input
              id="nomeRecebedorPix"
              name="nomeRecebedorPix"
              defaultValue={viagem.nomeRecebedorPix}
              className="campo py-2.5"
            />
          </Campo>
        </div>

        <Campo nome="descricao" rotulo="Descrição curta (aparece na capa)">
          <textarea
            id="descricao"
            name="descricao"
            rows={2}
            defaultValue={viagem.descricao}
            className="campo"
          />
        </Campo>

        <Campo nome="avisoGeral" rotulo="Aviso destacado na página inicial">
          <textarea
            id="avisoGeral"
            name="avisoGeral"
            rows={2}
            defaultValue={viagem.avisoGeral}
            className="campo"
          />
        </Campo>
      </FormAcao>
    </section>
  );
}

export function SecaoDatas({ datas }: { datas: OpcaoData[] }) {
  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Datas candidatas</h2>

      <ul className="mt-3 space-y-2">
        {datas.map((data) => (
          <li key={data.id} className="rounded-2xl border border-areia-200 bg-white/70 p-3">
            <details>
              <summary className="flex cursor-pointer items-center justify-between gap-3">
                <span className="font-medium text-oceano-900">
                  {data.rotulo}
                  {!data.ativa && <span className="ml-2 selo bg-areia-200 text-oceano-700">inativa</span>}
                </span>
                <span className="text-sm text-oceano-800/65">{pluralizar(data.noites, "noite", "noites")}</span>
              </summary>

              <div className="mt-3 space-y-3">
                <FormAcao acao={salvarData} textoBotao="Salvar data" estiloBotao="botao-suave">
                  <input type="hidden" name="id" value={data.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="rotulo">Entrada</label>
                      <input
                        name="inicio"
                        type="date"
                        defaultValue={paraInputDate(data.inicio)}
                        className="campo py-2.5"
                      />
                    </div>
                    <div>
                      <label className="rotulo">Saída</label>
                      <input
                        name="fim"
                        type="date"
                        defaultValue={paraInputDate(data.fim)}
                        className="campo py-2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="rotulo">Rótulo</label>
                    <input name="rotulo" defaultValue={data.rotulo} className="campo py-2.5" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-oceano-800">
                    <input type="checkbox" name="inativa" defaultChecked={!data.ativa} className="h-4 w-4 accent-mar-600" />
                    Não mostrar esta data para o grupo
                  </label>
                </FormAcao>

                <form action={excluirData}>
                  <input type="hidden" name="id" value={data.id} />
                  <BotaoAcao
                    className="text-sm font-medium text-coral-600 underline decoration-dotted"
                    confirmar="Remover esta data?"
                  >
                    Remover data
                  </BotaoAcao>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <details className="mt-4 rounded-2xl bg-areia-100/70 p-3">
        <summary className="cursor-pointer font-medium text-oceano-900">+ Nova data candidata</summary>
        <FormAcao acao={salvarData} textoBotao="Adicionar data" className="mt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="rotulo">Entrada</label>
              <input name="inicio" type="date" className="campo py-2.5" />
            </div>
            <div>
              <label className="rotulo">Saída</label>
              <input name="fim" type="date" className="campo py-2.5" />
            </div>
          </div>
          <div>
            <label className="rotulo">Rótulo (opcional)</label>
            <input name="rotulo" placeholder="16 a 19 de dezembro de 2026" className="campo py-2.5" />
          </div>
        </FormAcao>
      </details>
    </section>
  );
}
