import type { Casa, OpcaoData } from "@prisma/client";

import { alternarDisponibilidadeCasa, excluirCasa, salvarCasa } from "@/actions/organizador";
import { BotaoAcao } from "@/components/BotaoAcao";
import { FormAcao } from "@/components/FormAcao";
import { pluralizar, reais } from "@/lib/formato";

function CamposCasa({ casa, datas }: { casa?: Casa; datas: OpcaoData[] }) {
  const marcado = (valor: boolean | undefined) => (casa ? Boolean(valor) : true);

  return (
    <>
      {casa && <input type="hidden" name="id" value={casa.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="rotulo">Nome da casa</label>
          <input name="nome" defaultValue={casa?.nome} required className="campo py-2.5" />
        </div>
        <div className="sm:col-span-2">
          <label className="rotulo">Link do anúncio (Airbnb ou outro)</label>
          <input
            name="link"
            type="url"
            defaultValue={casa?.link}
            placeholder="https://www.airbnb.com.br/rooms/..."
            className="campo py-2.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="rotulo">Foto principal (endereço da imagem)</label>
          <input
            name="fotoUrl"
            defaultValue={casa?.fotoUrl}
            placeholder="https://... ou /uploads/casa.jpg"
            className="campo py-2.5"
          />
        </div>
        <div>
          <label className="rotulo">Região / bairro</label>
          <input name="regiao" defaultValue={casa?.regiao} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Distância da praia</label>
          <input name="distanciaPraia" defaultValue={casa?.distanciaPraia} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Capacidade oficial</label>
          <input name="capacidade" type="number" defaultValue={casa?.capacidade ?? 0} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Quartos</label>
          <input name="quartos" type="number" defaultValue={casa?.quartos ?? 0} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Camas</label>
          <input name="camas" type="number" defaultValue={casa?.camas ?? 0} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Banheiros</label>
          <input name="banheiros" type="number" defaultValue={casa?.banheiros ?? 0} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Valor total com taxas (R$)</label>
          <input
            name="valorTotal"
            type="number"
            step="0.01"
            defaultValue={casa?.valorTotal ?? 0}
            className="campo py-2.5"
          />
        </div>
        <div>
          <label className="rotulo">Hóspedes da cotação</label>
          <input
            name="hospedesCotacao"
            type="number"
            defaultValue={casa?.hospedesCotacao ?? 0}
            className="campo py-2.5"
          />
        </div>
        <div>
          <label className="rotulo">Datas da cotação</label>
          <select name="cotacaoDataId" defaultValue={casa?.cotacaoDataId ?? ""} className="campo py-2.5">
            <option value="">Não informado</option>
            {datas.map((data) => (
              <option key={data.id} value={data.id}>
                {data.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rotulo">Ordem de exibição</label>
          <input name="ordem" type="number" defaultValue={casa?.ordem ?? 0} className="campo py-2.5" />
        </div>
        <div>
          <label className="rotulo">Nota do Airbnb</label>
          <input
            name="notaAirbnb"
            type="number"
            step="0.01"
            max="5"
            defaultValue={casa?.notaAirbnb ?? ""}
            className="campo py-2.5"
          />
        </div>
        <div>
          <label className="rotulo">Número de avaliações</label>
          <input name="avaliacoes" type="number" defaultValue={casa?.avaliacoes ?? ""} className="campo py-2.5" />
        </div>
        <div className="sm:col-span-2">
          <label className="rotulo">Outros diferenciais (separados por vírgula)</label>
          <input
            name="extras"
            defaultValue={casa?.extras}
            placeholder="Jacuzzi, Sauna, Salão de jogos"
            className="campo py-2.5"
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { nome: "piscina", rotulo: "Piscina", valor: casa?.piscina },
          { nome: "churrasqueira", rotulo: "Churrasqueira", valor: casa?.churrasqueira },
          { nome: "arCondicionado", rotulo: "Ar-condicionado", valor: casa?.arCondicionado },
          { nome: "estacionamento", rotulo: "Estacionamento", valor: casa?.estacionamento },
        ].map((item) => (
          <label key={item.nome} className="flex items-center gap-2 text-sm text-oceano-800">
            <input
              type="checkbox"
              name={item.nome}
              defaultChecked={marcado(item.valor)}
              className="h-4 w-4 accent-mar-600"
            />
            {item.rotulo}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-oceano-800">
          <input
            type="checkbox"
            name="precoAConfirmar"
            defaultChecked={casa ? casa.precoAConfirmar : true}
            className="h-4 w-4 accent-mar-600"
          />
          Preço ainda a confirmar
        </label>
      </div>

      <div>
        <label className="rotulo">Custos obrigatórios fora da diária</label>
        <textarea
          name="custosObrigatorios"
          rows={2}
          defaultValue={casa?.custosObrigatorios}
          placeholder="Caseiro obrigatório, consumo de água e luz, caução…"
          className="campo"
        />
      </div>
      <div>
        <label className="rotulo">Regras relevantes</label>
        <textarea name="regras" rows={2} defaultValue={casa?.regras} className="campo" />
      </div>
      <div>
        <label className="rotulo">Observação destacada no cartão</label>
        <textarea name="alerta" rows={2} defaultValue={casa?.alerta} className="campo" />
      </div>
    </>
  );
}

export function SecaoCasas({
  casas,
  datas,
}: {
  casas: (Casa & { votos: { id: string }[] })[];
  datas: OpcaoData[];
}) {
  return (
    <section className="cartao">
      <h2 className="font-display text-xl">Casas candidatas</h2>
      <p className="mt-1 text-sm text-oceano-800/75">
        Somente você inclui, edita, remove ou marca casas como indisponíveis.
      </p>

      <ul className="mt-3 space-y-2">
        {casas.map((casa) => (
          <li key={casa.id} className="rounded-2xl border border-areia-200 bg-white/70 p-3">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-oceano-900">
                  {casa.nome}
                  {casa.indisponivel && (
                    <span className="ml-2 selo bg-oceano-900/10 text-oceano-800">indisponível</span>
                  )}
                </span>
                <span className="text-sm text-oceano-800/65">
                  {casa.valorTotal > 0 ? reais(casa.valorTotal) : "sem preço"} ·{" "}
                  {pluralizar(casa.votos.length, "voto", "votos")}
                </span>
              </summary>

              <div className="mt-3 space-y-3">
                <FormAcao acao={salvarCasa} textoBotao="Salvar casa" estiloBotao="botao-suave">
                  <CamposCasa casa={casa} datas={datas} />
                </FormAcao>

                <div className="flex flex-wrap gap-3 border-t border-areia-200 pt-3">
                  <form action={alternarDisponibilidadeCasa} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={casa.id} />
                    {!casa.indisponivel && (
                      <input
                        name="motivo"
                        placeholder="Motivo (ex.: já alugada)"
                        className="campo w-56 py-2"
                      />
                    )}
                    <BotaoAcao className="botao-suave px-4 py-2 text-sm">
                      {casa.indisponivel ? "Marcar como disponível" : "Marcar como indisponível"}
                    </BotaoAcao>
                  </form>

                  <form action={excluirCasa}>
                    <input type="hidden" name="id" value={casa.id} />
                    <BotaoAcao
                      className="text-sm font-medium text-coral-600 underline decoration-dotted"
                      confirmar={`Remover ${casa.nome} e os votos dessa casa?`}
                    >
                      Remover casa
                    </BotaoAcao>
                  </form>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <details className="mt-4 rounded-2xl bg-areia-100/70 p-3">
        <summary className="cursor-pointer font-medium text-oceano-900">+ Cadastrar nova casa</summary>
        <FormAcao acao={salvarCasa} textoBotao="Cadastrar casa" className="mt-3">
          <CamposCasa datas={datas} />
        </FormAcao>
      </details>
    </section>
  );
}
