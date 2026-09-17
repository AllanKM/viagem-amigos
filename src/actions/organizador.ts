"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { obterViagem } from "@/lib/dados";
import { prisma } from "@/lib/prisma";
import {
  abrirSessaoOrganizador,
  ehOrganizador,
  fecharSessaoOrganizador,
  pinCorreto,
} from "@/lib/sessao";

export type EstadoAdmin = { ok: boolean; mensagem: string } | null;

const ROTAS = ["/", "/presenca", "/casas", "/rateio", "/pagamentos", "/organizador"];

function revalidarTudo() {
  for (const rota of ROTAS) revalidatePath(rota);
}

async function exigirOrganizador() {
  if (!(await ehOrganizador())) throw new Error("Esta ação é restrita ao organizador.");
}

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "").trim();
const numero = (formData: FormData, campo: string, padrao = 0) => {
  const bruto = String(formData.get(campo) ?? "").replace(/\./g, "").replace(",", ".");
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : padrao;
};
const inteiro = (formData: FormData, campo: string, padrao = 0) => Math.round(numero(formData, campo, padrao));
const marcado = (formData: FormData, campo: string) => formData.get(campo) === "on";
const dataDoInput = (valor: string) => new Date(`${valor}T12:00:00-03:00`);

export async function entrarOrganizador(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  const pin = texto(formData, "pin");
  if (!pin) return { ok: false, mensagem: "Digite o PIN." };
  if (!pinCorreto(pin)) return { ok: false, mensagem: "PIN incorreto." };

  await abrirSessaoOrganizador();
  revalidatePath("/organizador");
  return { ok: true, mensagem: "Bem-vindo, organizador." };
}

export async function sairOrganizador() {
  await fecharSessaoOrganizador();
  revalidatePath("/organizador");
  redirect("/");
}

export async function salvarViagem(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const prazoConfirmacao = texto(formData, "prazoConfirmacao");
  const prazoVotacao = texto(formData, "prazoVotacao");

  await prisma.viagem.update({
    where: { id: 1 },
    data: {
      nome: texto(formData, "nome") || "Búzios em Família 2026",
      destino: texto(formData, "destino"),
      regioesPreferidas: texto(formData, "regioesPreferidas"),
      descricao: texto(formData, "descricao"),
      orcamentoMaximo: numero(formData, "orcamentoMaximo"),
      metaPessoas: inteiro(formData, "metaPessoas", 24),
      minPessoas: inteiro(formData, "minPessoas", 20),
      ...(prazoConfirmacao ? { prazoConfirmacao: dataDoInput(prazoConfirmacao) } : {}),
      ...(prazoVotacao ? { prazoVotacao: dataDoInput(prazoVotacao) } : {}),
      idadeIsenta: inteiro(formData, "idadeIsenta", 5),
      idadeMeia: inteiro(formData, "idadeMeia", 12),
      fatorMeia: Math.min(1, Math.max(0, numero(formData, "fatorMeia", 0.5))),
      percentualSinal: Math.min(100, Math.max(0, inteiro(formData, "percentualSinal", 30))),
      chavePix: texto(formData, "chavePix"),
      nomeRecebedorPix: texto(formData, "nomeRecebedorPix"),
      avisoGeral: texto(formData, "avisoGeral"),
    },
  });

  revalidarTudo();
  return { ok: true, mensagem: "Dados da viagem atualizados." };
}

export async function salvarCasa(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const nome = texto(formData, "nome");
  if (!nome) return { ok: false, mensagem: "A casa precisa de um nome." };

  const cotacaoDataId = texto(formData, "cotacaoDataId");

  const dados = {
    nome,
    link: texto(formData, "link"),
    fotoUrl: texto(formData, "fotoUrl"),
    regiao: texto(formData, "regiao"),
    capacidade: inteiro(formData, "capacidade"),
    quartos: inteiro(formData, "quartos"),
    camas: inteiro(formData, "camas"),
    banheiros: inteiro(formData, "banheiros"),
    piscina: marcado(formData, "piscina"),
    churrasqueira: marcado(formData, "churrasqueira"),
    arCondicionado: marcado(formData, "arCondicionado"),
    estacionamento: marcado(formData, "estacionamento"),
    extras: texto(formData, "extras"),
    distanciaPraia: texto(formData, "distanciaPraia"),
    valorTotal: numero(formData, "valorTotal"),
    precoAConfirmar: marcado(formData, "precoAConfirmar"),
    hospedesCotacao: inteiro(formData, "hospedesCotacao") || null,
    cotacaoDataId: cotacaoDataId || null,
    custosObrigatorios: texto(formData, "custosObrigatorios"),
    regras: texto(formData, "regras"),
    notaAirbnb: numero(formData, "notaAirbnb") || null,
    avaliacoes: inteiro(formData, "avaliacoes") || null,
    alerta: texto(formData, "alerta"),
    ordem: inteiro(formData, "ordem"),
  };

  const id = texto(formData, "id");
  if (id) {
    await prisma.casa.update({ where: { id }, data: dados });
  } else {
    const total = await prisma.casa.count();
    await prisma.casa.create({ data: { ...dados, ordem: dados.ordem || total + 1 } });
  }

  revalidarTudo();
  return { ok: true, mensagem: id ? "Casa atualizada." : `Casa "${nome}" cadastrada.` };
}

export async function excluirCasa(formData: FormData) {
  await exigirOrganizador();
  const id = texto(formData, "id");
  const viagem = await obterViagem();
  if (viagem.casaEscolhidaId === id) {
    await prisma.viagem.update({ where: { id: 1 }, data: { casaEscolhidaId: null } });
  }
  await prisma.casa.delete({ where: { id } });
  revalidarTudo();
}

export async function alternarDisponibilidadeCasa(formData: FormData) {
  await exigirOrganizador();
  const id = texto(formData, "id");
  const casa = await prisma.casa.findUnique({ where: { id } });
  if (!casa) return;
  await prisma.casa.update({
    where: { id },
    data: {
      indisponivel: !casa.indisponivel,
      motivoIndisponivel: casa.indisponivel ? "" : texto(formData, "motivo") || "Marcada como indisponível.",
    },
  });
  revalidarTudo();
}

export async function definirCasaEscolhida(formData: FormData) {
  await exigirOrganizador();
  const id = texto(formData, "id");
  await prisma.viagem.update({ where: { id: 1 }, data: { casaEscolhidaId: id || null } });
  revalidarTudo();
}

export async function alternarVotacao() {
  await exigirOrganizador();
  const viagem = await obterViagem();
  await prisma.viagem.update({ where: { id: 1 }, data: { votacaoAberta: !viagem.votacaoAberta } });
  revalidarTudo();
}

export async function abrirNovaRodada() {
  await exigirOrganizador();
  const viagem = await obterViagem();
  await prisma.viagem.update({
    where: { id: 1 },
    data: { rodadaVotacao: viagem.rodadaVotacao + 1, votacaoAberta: true },
  });
  revalidarTudo();
}

export async function salvarData(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const inicioBruto = texto(formData, "inicio");
  const fimBruto = texto(formData, "fim");
  if (!inicioBruto || !fimBruto) return { ok: false, mensagem: "Informe a data de entrada e de saída." };

  const inicio = dataDoInput(inicioBruto);
  const fim = dataDoInput(fimBruto);
  if (fim <= inicio) return { ok: false, mensagem: "A saída precisa ser depois da entrada." };

  const noites = Math.round((fim.getTime() - inicio.getTime()) / 86400000);
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const rotulo = texto(formData, "rotulo") || `${formatador.format(inicio)} a ${formatador.format(fim)}`;

  const id = texto(formData, "id");
  const dados = { rotulo, inicio, fim, noites, ordem: inteiro(formData, "ordem"), ativa: !marcado(formData, "inativa") };

  if (id) await prisma.opcaoData.update({ where: { id }, data: dados });
  else await prisma.opcaoData.create({ data: dados });

  revalidarTudo();
  return { ok: true, mensagem: "Datas atualizadas." };
}

export async function excluirData(formData: FormData) {
  await exigirOrganizador();
  await prisma.opcaoData.delete({ where: { id: texto(formData, "id") } });
  revalidarTudo();
}

/**
 * Cadastro em lote da lista de amigos. Uma pessoa por linha, no formato
 * "Nome Sobrenome | Família Allan" (o núcleo é opcional).
 */
export async function adicionarAmigos(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const linhas = texto(formData, "lista")
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);

  if (linhas.length === 0) return { ok: false, mensagem: "Cole ao menos um nome." };

  const ultimo = await prisma.amigo.findFirst({ orderBy: { ordem: "desc" } });
  let ordem = (ultimo?.ordem ?? 0) + 1;
  let criados = 0;
  let repetidos = 0;

  for (const linha of linhas) {
    const [parteNome, parteNucleo] = linha.split("|").map((pedaco) => pedaco?.trim() ?? "");
    const partes = parteNome.split(/\s+/);
    const nome = partes.shift() ?? "";
    const sobrenome = partes.join(" ");
    if (!nome) continue;

    const jaExiste = await prisma.amigo.findFirst({
      where: { nome, sobrenome, naLista: true },
    });
    if (jaExiste) {
      repetidos += 1;
      continue;
    }

    let nucleoId: string | null = null;
    if (parteNucleo) {
      const nucleo = await prisma.nucleo.upsert({
        where: { nome: parteNucleo },
        update: {},
        create: { nome: parteNucleo },
      });
      nucleoId = nucleo.id;
    }

    await prisma.amigo.create({ data: { nome, sobrenome, nucleoId, ordem } });
    ordem += 1;
    criados += 1;
  }

  revalidarTudo();
  return {
    ok: true,
    mensagem: `${criados} pessoa${criados === 1 ? "" : "s"} adicionada${criados === 1 ? "" : "s"} à lista${
      repetidos > 0 ? ` (${repetidos} já estava${repetidos === 1 ? "" : "m"} cadastrada${repetidos === 1 ? "" : "s"})` : ""
    }.`,
  };
}

export async function excluirAmigo(formData: FormData) {
  await exigirOrganizador();
  await prisma.amigo.delete({ where: { id: texto(formData, "id") } });
  revalidarTudo();
}

export async function alternarOrganizador(formData: FormData) {
  await exigirOrganizador();
  const id = texto(formData, "id");
  const amigo = await prisma.amigo.findUnique({ where: { id } });
  if (!amigo) return;
  await prisma.amigo.update({ where: { id }, data: { organizador: !amigo.organizador } });
  revalidarTudo();
}

export async function reabrirResposta(formData: FormData) {
  await exigirOrganizador();
  const id = texto(formData, "id");
  await prisma.amigo.deleteMany({ where: { responsavelId: id } });
  await prisma.amigo.update({
    where: { id },
    data: { status: "PENDENTE", aceiteCompromisso: false, respondidoEm: null },
  });
  revalidarTudo();
}

export async function salvarCusto(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const descricao = texto(formData, "descricao");
  if (!descricao) return { ok: false, mensagem: "Descreva o custo." };

  const dados = {
    descricao,
    valor: numero(formData, "valor"),
    incluirNoRateio: marcado(formData, "incluirNoRateio"),
    ordem: inteiro(formData, "ordem"),
  };

  const id = texto(formData, "id");
  if (id) await prisma.custoExtra.update({ where: { id }, data: dados });
  else await prisma.custoExtra.create({ data: dados });

  revalidarTudo();
  return { ok: true, mensagem: "Custos atualizados." };
}

export async function excluirCusto(formData: FormData) {
  await exigirOrganizador();
  await prisma.custoExtra.delete({ where: { id: texto(formData, "id") } });
  revalidarTudo();
}

export async function registrarPagamento(_estado: EstadoAdmin, formData: FormData): Promise<EstadoAdmin> {
  await exigirOrganizador();

  const nucleoId = texto(formData, "nucleoId");
  if (!nucleoId) return { ok: false, mensagem: "Escolha o núcleo que pagou." };

  const valor = numero(formData, "valor");
  if (valor <= 0) return { ok: false, mensagem: "Informe um valor maior que zero." };

  const pagoEm = texto(formData, "pagoEm");

  await prisma.pagamento.create({
    data: {
      nucleoId,
      valor,
      tipo: texto(formData, "tipo") || "SINAL",
      metodo: texto(formData, "metodo") || "PIX",
      observacao: texto(formData, "observacao"),
      ...(pagoEm ? { pagoEm: dataDoInput(pagoEm) } : {}),
    },
  });

  revalidarTudo();
  return { ok: true, mensagem: "Pagamento registrado." };
}

export async function excluirPagamento(formData: FormData) {
  await exigirOrganizador();
  await prisma.pagamento.delete({ where: { id: texto(formData, "id") } });
  revalidarTudo();
}
