"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { salvarPresenca, type EstadoForm } from "@/actions/presenca";
import { UploadFoto } from "@/components/UploadFoto";

type LinhaDependente = { id?: string; nome: string; adulto: boolean; idade: string };

type Props = {
  amigo: {
    id: string;
    nome: string;
    sobrenome: string;
    whatsapp: string;
    fotoUrl: string | null;
    status: string;
    observacoes: string;
    aceiteCompromisso: boolean;
    nucleoNome: string;
    preferenciaDataId: string | null;
  };
  dependentes: LinhaDependente[];
  datas: { id: string; rotulo: string; noites: number }[];
  nucleos: string[];
  regras: { idadeIsenta: number; idadeMeia: number; percentualSinal: number; prazo: string };
};

const OPCOES_STATUS = [
  {
    valor: "CONFIRMADO",
    titulo: "Confirmado",
    descricao: "Conta comigo",
    classe: "peer-checked:border-folha-500 peer-checked:bg-folha-100",
  },
  {
    valor: "TALVEZ",
    titulo: "Talvez",
    descricao: "Ainda depende",
    classe: "peer-checked:border-sol-500 peer-checked:bg-sol-100",
  },
  {
    valor: "NAO_VAI",
    titulo: "Não vou",
    descricao: "Nessa não dá",
    classe: "peer-checked:border-coral-500 peer-checked:bg-coral-100",
  },
];

export function FormularioPresenca({ amigo, dependentes, datas, nucleos, regras }: Props) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(salvarPresenca, null);
  const [status, setStatus] = useState(amigo.status === "PENDENTE" ? "CONFIRMADO" : amigo.status);
  const [linhas, setLinhas] = useState<LinhaDependente[]>(dependentes);

  const atualizarLinha = (indice: number, mudanca: Partial<LinhaDependente>) =>
    setLinhas((atual) => atual.map((linha, i) => (i === indice ? { ...linha, ...mudanca } : linha)));

  const naoVai = status === "NAO_VAI";

  return (
    <form action={acao} className="space-y-5">
      <input type="hidden" name="amigoId" value={amigo.id} />
      <input
        type="hidden"
        name="dependentes"
        value={JSON.stringify(
          linhas
            .filter((linha) => linha.nome.trim() !== "")
            .map((linha) => ({
              id: linha.id,
              nome: linha.nome,
              adulto: linha.adulto,
              idade: linha.adulto ? null : linha.idade,
            })),
        )}
      />

      <section className="cartao space-y-4">
        <UploadFoto
          amigoId={amigo.id}
          nome={amigo.nome}
          sobrenome={amigo.sobrenome}
          fotoUrl={amigo.fotoUrl}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="rotulo" htmlFor="nome">
              Nome
            </label>
            <input id="nome" name="nome" defaultValue={amigo.nome} required className="campo" />
          </div>
          <div>
            <label className="rotulo" htmlFor="sobrenome">
              Sobrenome
            </label>
            <input id="sobrenome" name="sobrenome" defaultValue={amigo.sobrenome} className="campo" />
          </div>
          <div>
            <label className="rotulo" htmlFor="whatsapp">
              WhatsApp <span className="font-normal text-oceano-800/50">(opcional)</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              placeholder="(21) 99999-0000"
              defaultValue={amigo.whatsapp}
              className="campo"
            />
          </div>
          <div>
            <label className="rotulo" htmlFor="nucleo">
              Núcleo / família
            </label>
            <input
              id="nucleo"
              name="nucleo"
              list="lista-nucleos"
              placeholder="Família Allan"
              defaultValue={amigo.nucleoNome}
              className="campo"
            />
            <datalist id="lista-nucleos">
              {nucleos.map((nucleo) => (
                <option key={nucleo} value={nucleo} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-oceano-800/60">
              O rateio e os pagamentos são organizados por núcleo.
            </p>
          </div>
        </div>
      </section>

      <section className="cartao">
        <h2 className="font-display text-lg">Você vai?</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {OPCOES_STATUS.map((opcao) => (
            <label key={opcao.valor} className="cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opcao.valor}
                checked={status === opcao.valor}
                onChange={() => setStatus(opcao.valor)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full flex-col rounded-2xl border-2 border-areia-200 bg-white px-4 py-3 transition peer-focus-visible:ring-4 peer-focus-visible:ring-mar-100 ${opcao.classe}`}
              >
                <span className="font-semibold text-oceano-900">{opcao.titulo}</span>
                <span className="text-sm text-oceano-800/70">{opcao.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {!naoVai && (
        <>
          <section className="cartao">
            <h2 className="font-display text-lg">Qual data você prefere?</h2>
            <div className="mt-3 space-y-2">
              {datas.map((data) => (
                <label
                  key={data.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-areia-200 bg-white px-4 py-3 has-checked:border-mar-400 has-checked:bg-mar-50"
                >
                  <input
                    type="radio"
                    name="preferenciaDataId"
                    value={data.id}
                    defaultChecked={amigo.preferenciaDataId === data.id}
                    className="h-4 w-4 accent-mar-600"
                  />
                  <span>
                    <span className="block font-medium text-oceano-900">{data.rotulo}</span>
                    <span className="text-sm text-oceano-800/65">{data.noites} noites</span>
                  </span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-areia-200 bg-white px-4 py-3 has-checked:border-mar-400 has-checked:bg-mar-50">
                <input
                  type="radio"
                  name="preferenciaDataId"
                  value=""
                  defaultChecked={!amigo.preferenciaDataId}
                  className="h-4 w-4 accent-mar-600"
                />
                <span className="font-medium text-oceano-900">Tanto faz, vou na que a maioria escolher</span>
              </label>
            </div>
          </section>

          <section className="cartao">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg">Quem vai com você</h2>
              <span className="text-xs text-oceano-800/60">
                Crianças até {regras.idadeIsenta} anos não pagam; até {regras.idadeMeia} anos pagam meia
              </span>
            </div>

            {linhas.length === 0 && (
              <p className="mt-2 text-sm text-oceano-800/70">
                Vai sozinho? Pode seguir. Se for levar cônjuge, filhos ou outra pessoa do seu núcleo,
                adicione abaixo — assim você confirma todo mundo de uma vez.
              </p>
            )}

            <ul className="mt-3 space-y-3">
              {linhas.map((linha, indice) => (
                <li key={linha.id ?? `nova-${indice}`} className="rounded-2xl bg-areia-100/70 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                    <div>
                      <label className="rotulo text-xs">Nome</label>
                      <input
                        value={linha.nome}
                        onChange={(evento) => atualizarLinha(indice, { nome: evento.target.value })}
                        placeholder="Nome do acompanhante"
                        className="campo py-2.5"
                      />
                    </div>
                    <div>
                      <label className="rotulo text-xs">Tipo</label>
                      <select
                        value={linha.adulto ? "adulto" : "crianca"}
                        onChange={(evento) =>
                          atualizarLinha(indice, { adulto: evento.target.value === "adulto" })
                        }
                        className="campo py-2.5"
                      >
                        <option value="adulto">Adulto</option>
                        <option value="crianca">Criança</option>
                      </select>
                    </div>
                    <div className={linha.adulto ? "invisible" : ""}>
                      <label className="rotulo text-xs">Idade</label>
                      <input
                        type="number"
                        min={0}
                        max={17}
                        value={linha.idade}
                        onChange={(evento) => atualizarLinha(indice, { idade: evento.target.value })}
                        className="campo w-24 py-2.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLinhas((atual) => atual.filter((_, i) => i !== indice))}
                      className="botao-suave px-3 py-2.5 text-sm text-coral-600"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                setLinhas((atual) => [...atual, { nome: "", adulto: false, idade: "" }])
              }
              className="botao-suave mt-3 px-4 py-2 text-sm"
            >
              + Adicionar pessoa do meu núcleo
            </button>
          </section>

          <section className="cartao space-y-3">
            <div>
              <label className="rotulo" htmlFor="observacoes">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={4}
                defaultValue={amigo.observacoes}
                placeholder="Precisa de berço, tem restrição de mobilidade, prefere quarto no térreo, alergia a algum alimento, chega mais tarde…"
                className="campo"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-mar-50 p-4">
              <input
                type="checkbox"
                name="aceiteCompromisso"
                defaultChecked={amigo.aceiteCompromisso}
                className="mt-0.5 h-5 w-5 shrink-0 accent-mar-600"
              />
              <span className="text-sm text-oceano-800">
                Entendo que a reserva depende do pagamento do sinal ({regras.percentualSinal}% da minha
                parte) dentro do prazo, até {regras.prazo}.
              </span>
            </label>
          </section>
        </>
      )}

      {estado && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            estado.ok ? "bg-folha-100 text-folha-600" : "bg-coral-100 text-coral-600"
          }`}
        >
          {estado.mensagem}
          {estado.ok && (
            <>
              {" "}
              <Link href="/casas" className="underline decoration-dotted">
                Agora vote na casa
              </Link>
              .
            </>
          )}
        </p>
      )}

      <div className="sticky bottom-20 z-10 flex gap-2 sm:bottom-4">
        <button type="submit" disabled={enviando} className="botao-coral w-full shadow-lg">
          {enviando ? "Salvando…" : "Salvar minha resposta"}
        </button>
      </div>
    </form>
  );
}
