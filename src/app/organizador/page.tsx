import Link from "next/link";

import { entrarOrganizador, sairOrganizador } from "@/actions/organizador";
import { BotaoAcao } from "@/components/BotaoAcao";
import { FormAcao } from "@/components/FormAcao";
import { SecaoAmigos } from "@/components/organizador/SecaoAmigos";
import { SecaoCasas } from "@/components/organizador/SecaoCasas";
import { SecaoCustos, SecaoPagamentos } from "@/components/organizador/SecaoFinanceiro";
import { SecaoDatas, SecaoViagem, SecaoVotacao } from "@/components/organizador/SecaoViagem";
import {
  obterAmigos,
  obterCasas,
  obterCustos,
  obterDatas,
  obterRateioAtual,
  obterSaldos,
  resumirPresenca,
} from "@/lib/dados";
import { pluralizar, reais } from "@/lib/formato";
import { prisma } from "@/lib/prisma";
import { ehOrganizador } from "@/lib/sessao";

function Entrada() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <section className="cartao">
        <h1 className="font-display text-2xl">Área do organizador</h1>
        <p className="mt-1 text-sm text-oceano-800/75">
          Aqui ficam o cadastro das casas, a lista de amigos, os custos e a baixa dos pagamentos. Digite o
          PIN para entrar.
        </p>

        <FormAcao acao={entrarOrganizador} textoBotao="Entrar" textoEnviando="Conferindo…" className="mt-4">
          <div>
            <label className="rotulo" htmlFor="pin">
              PIN do organizador
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              className="campo"
            />
          </div>
        </FormAcao>

        <p className="mt-4 text-xs text-oceano-800/60">
          O PIN fica na variável <code className="font-mono">ORGANIZADOR_PIN</code> do arquivo{" "}
          <code className="font-mono">.env</code>.
        </p>
      </section>

      <p className="text-center text-sm text-oceano-800/70">
        Quer sugerir uma casa? Fale com o organizador pelo WhatsApp ou{" "}
        <Link href="/casas" className="underline decoration-dotted">
          veja as opções já cadastradas
        </Link>
        .
      </p>
    </div>
  );
}

export default async function PaginaOrganizador() {
  if (!(await ehOrganizador())) return <Entrada />;

  const { viagem, rateio, casa } = await obterRateioAtual();
  const [casas, datas, amigos, custos, nucleos, saldos] = await Promise.all([
    obterCasas(viagem.rodadaVotacao),
    obterDatas(),
    obterAmigos(),
    obterCustos(),
    prisma.nucleo.findMany({ orderBy: { nome: "asc" } }),
    obterSaldos(rateio),
  ]);

  const resumo = resumirPresenca(amigos, viagem.metaPessoas);
  const totalVotos = casas.reduce((soma, item) => soma + item.votos.length, 0);
  const totalPago = saldos.reduce((soma, linha) => soma + linha.pago, 0);

  return (
    <div className="space-y-5">
      <section className="cartao">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Painel do organizador</h1>
            <p className="mt-1 text-sm text-oceano-800/75">
              {resumo.confirmados} confirmados de {viagem.metaPessoas} · {resumo.pendentes} sem resposta ·{" "}
              {pluralizar(totalVotos, "voto", "votos")} · {reais(totalPago)} recebidos de{" "}
              {reais(rateio.total)}
              {casa ? ` · base: ${casa.nome}` : " · nenhuma casa definida"}
            </p>
          </div>
          <form action={sairOrganizador}>
            <BotaoAcao className="botao-suave px-4 py-2 text-sm">Sair</BotaoAcao>
          </form>
        </div>
      </section>

      <SecaoVotacao viagem={viagem} casas={casas} totalVotos={totalVotos} />
      <SecaoAmigos amigos={amigos} />
      <SecaoCasas casas={casas} datas={datas} />
      <SecaoCustos custos={custos} />
      <SecaoPagamentos nucleos={nucleos} saldos={saldos} />
      <SecaoDatas datas={datas} />
      <SecaoViagem viagem={viagem} />
    </div>
  );
}
