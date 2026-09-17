import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioPresenca } from "@/components/FormularioPresenca";
import { obterDatas, obterViagem } from "@/lib/dados";
import { dataLonga } from "@/lib/formato";
import { prisma } from "@/lib/prisma";

export default async function PaginaConfirmacao({ params }: PageProps<"/presenca/[id]">) {
  const { id } = await params;

  const [amigo, viagem, datas, nucleos] = await Promise.all([
    prisma.amigo.findUnique({
      where: { id },
      include: {
        nucleo: true,
        dependentes: { orderBy: { criadoEm: "asc" } },
      },
    }),
    obterViagem(),
    obterDatas(),
    prisma.nucleo.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!amigo) notFound();

  return (
    <div className="space-y-4">
      <Link href="/presenca" className="text-sm text-oceano-800/70 underline decoration-dotted">
        ← voltar para a lista
      </Link>

      <div>
        <h1 className="font-display text-2xl">
          Oi, {amigo.nome}! Vamos para {viagem.destino}?
        </h1>
        <p className="mt-1 text-sm text-oceano-800/75">
          Responda por você e por quem vem no seu núcleo. Dá para voltar e mudar depois, até{" "}
          {dataLonga(viagem.prazoConfirmacao)}.
        </p>
      </div>

      <FormularioPresenca
        amigo={{
          id: amigo.id,
          nome: amigo.nome,
          sobrenome: amigo.sobrenome,
          whatsapp: amigo.whatsapp,
          fotoUrl: amigo.fotoUrl,
          status: amigo.status,
          observacoes: amigo.observacoes,
          aceiteCompromisso: amigo.aceiteCompromisso,
          nucleoNome: amigo.nucleo?.nome ?? "",
          preferenciaDataId: amigo.preferenciaDataId,
        }}
        dependentes={amigo.dependentes.map((dependente) => ({
          id: dependente.id,
          nome: dependente.nome,
          adulto: dependente.adulto,
          idade: dependente.idade === null ? "" : String(dependente.idade),
        }))}
        datas={datas
          .filter((data) => data.ativa)
          .map((data) => ({ id: data.id, rotulo: data.rotulo, noites: data.noites }))}
        nucleos={nucleos.map((nucleo) => nucleo.nome)}
        regras={{
          idadeIsenta: viagem.idadeIsenta,
          idadeMeia: viagem.idadeMeia,
          percentualSinal: viagem.percentualSinal,
          prazo: dataLonga(viagem.prazoConfirmacao),
        }}
      />
    </div>
  );
}
