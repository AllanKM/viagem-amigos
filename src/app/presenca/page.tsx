import Link from "next/link";

import { euSou, naoSouEu } from "@/actions/presenca";
import { Avatar } from "@/components/Avatar";
import { BarraProgresso } from "@/components/BarraProgresso";
import { FundoPraia, OndaBranca } from "@/components/FundoPraia";
import { SeloStatus } from "@/components/SeloStatus";
import { obterAmigos, obterNucleos, obterViagem, resumirPresenca } from "@/lib/dados";
import { dataLonga, pluralizar, primeiroNome, textoPrazo } from "@/lib/formato";
import { idDoParticipante } from "@/lib/sessao";

const ANEL: Record<string, string> = {
  CONFIRMADO: "ring-folha-500",
  TALVEZ: "ring-sol-500",
  NAO_VAI: "ring-coral-400",
  PENDENTE: "ring-areia-300",
};

export default async function PaginaPresenca() {
  const [viagem, amigos, nucleos, meuId] = await Promise.all([
    obterViagem(),
    obterAmigos(),
    obterNucleos(),
    idDoParticipante(),
  ]);

  const lista = amigos.filter((amigo) => amigo.naLista);
  const resumo = resumirPresenca(amigos, viagem.metaPessoas);
  const eu = lista.find((amigo) => amigo.id === meuId);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-white/50 shadow-[0_22px_55px_-38px_rgba(8,37,46,0.9)]">
        <FundoPraia className="px-5 pt-6 pb-5">
          <h1 className="font-display text-2xl text-white drop-shadow-[0_3px_12px_rgba(8,37,46,0.55)]">
            Confirmação de presença
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/85">
            Clique na sua foto para responder. Você pode confirmar de uma vez todo o seu núcleo: cônjuge,
            filhos e quem mais vier com você.
          </p>
          <p className="mt-2 text-sm font-semibold text-sol-100">
            Prazo para responder: {dataLonga(viagem.prazoConfirmacao)} ({textoPrazo(viagem.prazoConfirmacao)}).
          </p>
          <OndaBranca className="-mx-5 -mb-5 mt-5 h-5 text-white/90" />
        </FundoPraia>

        <div className="bg-white/90 px-5 py-5 backdrop-blur">
          <BarraProgresso valor={resumo.confirmados} meta={viagem.metaPessoas} talvez={resumo.talvez} />

          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {[
              { rotulo: "Confirmados", valor: resumo.confirmados },
              { rotulo: "Talvez", valor: resumo.talvez },
              { rotulo: "Não vão", valor: resumo.naoVao },
              { rotulo: "Sem resposta", valor: resumo.pendentes },
            ].map((item) => (
              <div key={item.rotulo} className="rounded-2xl bg-areia-100/80 px-3 py-2">
                <dt className="text-xs text-oceano-800/65">{item.rotulo}</dt>
                <dd className="font-display text-lg text-oceano-900">{item.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {eu && (
        <section className="cartao flex flex-wrap items-center gap-3 border-mar-200 bg-mar-50/80">
          <Avatar nome={eu.nome} sobrenome={eu.sobrenome} fotoUrl={eu.fotoUrl} tamanho="m" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-oceano-900">Você é {primeiroNome(eu.nome)}</p>
            <p className="text-sm text-oceano-800/70">
              {eu.status === "PENDENTE" ? "Ainda falta a sua resposta." : "Resposta já registrada."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/presenca/${eu.id}`} className="botao-primario px-4 py-2 text-sm">
              {eu.status === "PENDENTE" ? "Responder" : "Editar resposta"}
            </Link>
            <form action={naoSouEu}>
              <button type="submit" className="botao-suave px-4 py-2 text-sm">
                Não sou eu
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="cartao">
        <h2 className="font-display text-xl">Quem é você?</h2>
        <p className="mt-1 text-sm text-oceano-800/70">
          Toque no seu rosto. A borda mostra quem já respondeu.
        </p>

        {lista.length <= 1 && (
          <p className="mt-3 rounded-2xl bg-sol-100 px-4 py-3 text-sm text-oceano-800">
            A lista de amigos ainda não foi cadastrada. O organizador pode colar todos os nomes de uma vez
            no{" "}
            <Link href="/organizador" className="font-semibold underline decoration-dotted">
              painel do organizador
            </Link>
            .
          </p>
        )}

        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {lista.map((amigo) => (
            <li key={amigo.id}>
              <form action={euSou.bind(null, amigo.id)}>
                <button
                  type="submit"
                  className="flex w-full flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition hover:bg-areia-100"
                >
                  <Avatar
                    nome={amigo.nome}
                    sobrenome={amigo.sobrenome}
                    fotoUrl={amigo.fotoUrl}
                    tamanho="g"
                    className={`ring-3 ring-offset-2 ring-offset-white ${ANEL[amigo.status] ?? ANEL.PENDENTE} ${
                      amigo.status === "NAO_VAI" ? "opacity-60" : ""
                    }`}
                  />
                  <span className="w-full truncate text-sm font-medium text-oceano-900">
                    {primeiroNome(amigo.nome)}
                  </span>
                  <span className="w-full truncate text-[11px] text-oceano-800/60">
                    {amigo.nucleo?.nome ?? "sem núcleo"}
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="cartao">
        <h2 className="font-display text-xl">Respostas por núcleo</h2>
        <p className="mt-1 text-sm text-oceano-800/70">
          {pluralizar(resumo.confirmados, "pessoa confirmada", "pessoas confirmadas")} até agora, contando
          adultos e crianças.
        </p>

        <ul className="mt-4 space-y-4">
          {nucleos
            .filter((nucleo) => nucleo.amigos.length > 0)
            .map((nucleo) => (
              <li key={nucleo.id}>
                <p className="font-display text-lg text-oceano-900">{nucleo.nome}</p>
                <ul className="mt-2 divide-y divide-areia-200 overflow-hidden rounded-2xl border border-areia-200">
                  {nucleo.amigos.map((membro) => (
                    <li key={membro.id} className="flex items-center gap-3 bg-white/70 px-3 py-2.5">
                      <Avatar
                        nome={membro.nome}
                        sobrenome={membro.sobrenome}
                        fotoUrl={membro.fotoUrl}
                        tamanho="p"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-oceano-900">
                          {membro.nome} {membro.sobrenome}
                        </p>
                        <p className="text-xs text-oceano-800/60">
                          {membro.adulto
                            ? "Adulto"
                            : `Criança${membro.idade !== null ? ` · ${membro.idade} anos` : ""}`}
                          {membro.naLista ? "" : " · acompanhante"}
                        </p>
                      </div>
                      <SeloStatus status={membro.status} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
