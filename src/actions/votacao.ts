"use server";

import { revalidatePath } from "next/cache";

import { obterViagem } from "@/lib/dados";
import { prisma } from "@/lib/prisma";
import { idDoParticipante } from "@/lib/sessao";

export type EstadoVoto = { ok: boolean; mensagem: string } | null;

export async function votar(_estado: EstadoVoto, formData: FormData): Promise<EstadoVoto> {
  const meuId = await idDoParticipante();
  if (!meuId) {
    return { ok: false, mensagem: "Antes de votar, clique na sua foto na página de presença." };
  }

  const eu = await prisma.amigo.findUnique({ where: { id: meuId } });
  if (!eu) return { ok: false, mensagem: "Não encontramos você na lista. Escolha sua foto novamente." };

  const viagem = await obterViagem();
  if (!viagem.votacaoAberta) {
    return { ok: false, mensagem: "A votação está encerrada. Fale com o organizador." };
  }

  const casaId = String(formData.get("casaId") ?? "");
  const casa = await prisma.casa.findUnique({ where: { id: casaId } });
  if (!casa) return { ok: false, mensagem: "Essa casa não está mais na lista." };
  if (casa.indisponivel) return { ok: false, mensagem: "Essa casa foi marcada como indisponível." };

  const comentario = String(formData.get("comentario") ?? "").trim().slice(0, 280);

  await prisma.voto.upsert({
    where: { amigoId_rodada: { amigoId: meuId, rodada: viagem.rodadaVotacao } },
    update: { casaId, comentario },
    create: { amigoId: meuId, casaId, comentario, rodada: viagem.rodadaVotacao },
  });

  revalidatePath("/casas");
  revalidatePath("/");
  revalidatePath("/organizador");

  return { ok: true, mensagem: `Voto registrado em ${casa.nome}. Pode trocar até o fim do prazo.` };
}

export async function removerMeuVoto() {
  const meuId = await idDoParticipante();
  if (!meuId) return;
  const viagem = await obterViagem();
  await prisma.voto.deleteMany({ where: { amigoId: meuId, rodada: viagem.rodadaVotacao } });
  revalidatePath("/casas");
  revalidatePath("/");
}
