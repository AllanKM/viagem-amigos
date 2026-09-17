"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { definirParticipante, limparParticipante } from "@/lib/sessao";

export type EstadoForm = { ok: boolean; mensagem: string } | null;

const STATUS_VALIDOS = ["CONFIRMADO", "TALVEZ", "NAO_VAI"];

function revalidarTudo() {
  for (const rota of ["/", "/presenca", "/casas", "/rateio", "/pagamentos", "/organizador"]) {
    revalidatePath(rota);
  }
}

export async function euSou(amigoId: string) {
  const amigo = await prisma.amigo.findUnique({ where: { id: amigoId } });
  if (!amigo) return;
  await definirParticipante(amigoId);
  revalidatePath("/presenca");
  redirect(`/presenca/${amigoId}`);
}

export async function naoSouEu() {
  await limparParticipante();
  revalidatePath("/presenca");
  redirect("/presenca");
}

type DependenteEnviado = {
  id?: string;
  nome?: string;
  adulto?: boolean;
  idade?: number | string | null;
};

function lerDependentes(bruto: FormDataEntryValue | null): DependenteEnviado[] {
  if (typeof bruto !== "string" || bruto.trim() === "") return [];
  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export async function salvarPresenca(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const amigoId = String(formData.get("amigoId") ?? "");
  const amigo = await prisma.amigo.findUnique({ where: { id: amigoId } });
  if (!amigo) return { ok: false, mensagem: "Não encontramos essa pessoa na lista." };

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { ok: false, mensagem: "Preencha o nome." };

  const status = String(formData.get("status") ?? "");
  if (!STATUS_VALIDOS.includes(status)) {
    return { ok: false, mensagem: "Escolha uma resposta: confirmado, talvez ou não vai." };
  }

  const aceite = formData.get("aceiteCompromisso") === "on";
  if (status === "CONFIRMADO" && !aceite) {
    return {
      ok: false,
      mensagem: "Para confirmar é preciso marcar o aceite sobre o prazo do sinal.",
    };
  }

  const nucleoNome = String(formData.get("nucleo") ?? "").trim();
  if (status !== "NAO_VAI" && !nucleoNome) {
    return { ok: false, mensagem: "Informe o núcleo ou família (por exemplo: Família Allan)." };
  }

  let nucleoId = amigo.nucleoId;
  if (nucleoNome) {
    const nucleo = await prisma.nucleo.upsert({
      where: { nome: nucleoNome },
      update: {},
      create: { nome: nucleoNome },
    });
    nucleoId = nucleo.id;
  }

  const preferenciaBruta = String(formData.get("preferenciaDataId") ?? "");
  const preferenciaDataId = preferenciaBruta === "" ? null : preferenciaBruta;

  const dependentes = lerDependentes(formData.get("dependentes"));
  const normalizados = dependentes
    .map((dependente) => {
      const nomeDependente = String(dependente.nome ?? "").trim();
      const adulto = Boolean(dependente.adulto);
      const idadeBruta = dependente.idade;
      const idade =
        idadeBruta === null || idadeBruta === undefined || idadeBruta === ""
          ? null
          : Number(idadeBruta);
      return { id: dependente.id, nome: nomeDependente, adulto, idade };
    })
    .filter((dependente) => dependente.nome !== "");

  for (const dependente of normalizados) {
    if (!dependente.adulto && (dependente.idade === null || Number.isNaN(dependente.idade))) {
      return { ok: false, mensagem: `Informe a idade de ${dependente.nome}.` };
    }
    if (dependente.idade !== null && (dependente.idade < 0 || dependente.idade > 120)) {
      return { ok: false, mensagem: `A idade de ${dependente.nome} parece inválida.` };
    }
  }

  const statusDependente = status;

  await prisma.$transaction(async (tx) => {
    await tx.amigo.update({
      where: { id: amigoId },
      data: {
        nome,
        sobrenome: String(formData.get("sobrenome") ?? "").trim(),
        whatsapp: String(formData.get("whatsapp") ?? "").trim(),
        nucleoId,
        status,
        preferenciaDataId,
        observacoes: String(formData.get("observacoes") ?? "").trim(),
        aceiteCompromisso: aceite,
        respondidoEm: new Date(),
      },
    });

    const idsMantidos = normalizados.map((dependente) => dependente.id).filter(Boolean) as string[];
    await tx.amigo.deleteMany({
      where: { responsavelId: amigoId, id: { notIn: idsMantidos.length ? idsMantidos : ["-"] } },
    });

    for (const dependente of normalizados) {
      const dados = {
        nome: dependente.nome,
        adulto: dependente.adulto,
        idade: dependente.adulto ? null : dependente.idade,
        nucleoId,
        status: statusDependente,
        preferenciaDataId,
        naLista: false,
        responsavelId: amigoId,
        respondidoEm: new Date(),
      };

      if (dependente.id) {
        await tx.amigo.update({ where: { id: dependente.id }, data: dados });
      } else {
        await tx.amigo.create({ data: dados });
      }
    }
  });

  revalidarTudo();

  const acompanhantes = normalizados.length;
  const complemento =
    acompanhantes > 0
      ? ` Registramos você e ${acompanhantes} acompanhante${acompanhantes === 1 ? "" : "s"}.`
      : "";

  return {
    ok: true,
    mensagem:
      status === "CONFIRMADO"
        ? `Presença confirmada, obrigado!${complemento}`
        : status === "TALVEZ"
          ? `Resposta salva como "talvez".${complemento}`
          : "Resposta salva. Vamos sentir sua falta!",
  };
}
