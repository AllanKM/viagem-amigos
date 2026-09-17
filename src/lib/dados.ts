import { prisma } from "@/lib/prisma";
import {
  calcularRateio,
  cotasDeReferencia,
  montarPessoas,
  type Rateio,
} from "@/lib/rateio";

export const STATUS_ROTULOS: Record<string, string> = {
  PENDENTE: "Ainda não respondeu",
  CONFIRMADO: "Confirmado",
  TALVEZ: "Talvez",
  NAO_VAI: "Não vai",
};

export async function obterViagem() {
  const existente = await prisma.viagem.findUnique({ where: { id: 1 } });
  if (existente) return existente;

  const hoje = new Date();
  const emUmMes = new Date(hoje.getTime() + 30 * 86400000);
  return prisma.viagem.create({
    data: { id: 1, prazoConfirmacao: emUmMes, prazoVotacao: emUmMes },
  });
}

export async function obterDatas() {
  return prisma.opcaoData.findMany({ orderBy: [{ ordem: "asc" }, { inicio: "asc" }] });
}

export async function obterAmigos() {
  return prisma.amigo.findMany({
    include: { nucleo: true, preferenciaData: true, responsavel: { select: { id: true, nome: true } } },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });
}

export async function obterNucleos() {
  return prisma.nucleo.findMany({
    include: { amigos: { orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] } },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export async function obterCustos() {
  return prisma.custoExtra.findMany({ orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] });
}

export async function obterCasas(rodada: number) {
  return prisma.casa.findMany({
    include: {
      cotacaoData: true,
      votos: {
        where: { rodada },
        include: { amigo: { select: { id: true, nome: true, sobrenome: true, fotoUrl: true } } },
        orderBy: { criadoEm: "asc" },
      },
    },
    orderBy: [{ indisponivel: "asc" }, { ordem: "asc" }, { criadoEm: "asc" }],
  });
}

export type ResumoPresenca = {
  confirmados: number;
  talvez: number;
  naoVao: number;
  pendentes: number;
  adultosConfirmados: number;
  criancasConfirmadas: number;
  responderam: number;
  naLista: number;
  progresso: number;
};

type AmigoBasico = { status: string; adulto: boolean; naLista: boolean };

export function resumirPresenca(amigos: AmigoBasico[], metaPessoas: number): ResumoPresenca {
  const confirmados = amigos.filter((a) => a.status === "CONFIRMADO");
  const talvez = amigos.filter((a) => a.status === "TALVEZ");
  const naoVao = amigos.filter((a) => a.status === "NAO_VAI");
  const pendentes = amigos.filter((a) => a.status === "PENDENTE" && a.naLista);

  return {
    confirmados: confirmados.length,
    talvez: talvez.length,
    naoVao: naoVao.length,
    pendentes: pendentes.length,
    adultosConfirmados: confirmados.filter((a) => a.adulto).length,
    criancasConfirmadas: confirmados.filter((a) => !a.adulto).length,
    responderam: amigos.filter((a) => a.naLista && a.status !== "PENDENTE").length,
    naLista: amigos.filter((a) => a.naLista).length,
    progresso: metaPessoas > 0 ? Math.min(100, Math.round((confirmados.length / metaPessoas) * 100)) : 0,
  };
}

/** Casa usada como base do rateio: a escolhida pelo organizador ou a líder da votação. */
export async function obterCasaBase(casaEscolhidaId: string | null, rodada: number) {
  if (casaEscolhidaId) {
    const escolhida = await prisma.casa.findUnique({ where: { id: casaEscolhidaId } });
    if (escolhida) return { casa: escolhida, origem: "ESCOLHIDA" as const };
  }

  const casas = await prisma.casa.findMany({
    where: { indisponivel: false },
    include: { _count: { select: { votos: { where: { rodada } } } } },
  });

  const lider = casas
    .filter((casa) => casa._count.votos > 0)
    .sort((a, b) => b._count.votos - a._count.votos)[0];

  return lider ? { casa: lider, origem: "LIDER_VOTACAO" as const } : { casa: null, origem: "SEM_CASA" as const };
}

export async function obterRateioAtual() {
  const viagem = await obterViagem();
  const [amigos, extras, base] = await Promise.all([
    prisma.amigo.findMany({ include: { nucleo: true } }),
    obterCustos(),
    obterCasaBase(viagem.casaEscolhidaId, viagem.rodadaVotacao),
  ]);

  const pessoas = montarPessoas(amigos, viagem);
  const rateio = calcularRateio({
    viagem,
    pessoas,
    valorCasa: base.casa?.valorTotal ?? 0,
    extras,
  });

  return { viagem, rateio, casa: base.casa, origemCasa: base.origem, amigos };
}

/** Estimativa por adulto mostrada nos cartões das casas. */
export function estimativaPorAdulto(
  valorTotalCasa: number,
  cotasConfirmadas: number,
  viagem: { metaPessoas: number; percentualSinal: number; fatorMeia: number },
  capacidadeCasa: number,
) {
  const cotas = cotasDeReferencia(cotasConfirmadas, viagem as never, capacidadeCasa);
  return { cotas, valor: cotas > 0 ? valorTotalCasa / cotas : 0 };
}

export type ItemRanking = {
  id: string;
  nome: string;
  regiao: string;
  votos: number;
  indisponivel: boolean;
  percentual: number;
};

export async function obterRanking(rodada: number): Promise<{ itens: ItemRanking[]; totalVotos: number }> {
  const casas = await prisma.casa.findMany({
    include: { _count: { select: { votos: { where: { rodada } } } } },
    orderBy: [{ ordem: "asc" }],
  });

  const totalVotos = casas.reduce((soma, casa) => soma + casa._count.votos, 0);
  const itens = casas
    .map((casa) => ({
      id: casa.id,
      nome: casa.nome,
      regiao: casa.regiao,
      votos: casa._count.votos,
      indisponivel: casa.indisponivel,
      percentual: totalVotos > 0 ? Math.round((casa._count.votos / totalVotos) * 100) : 0,
    }))
    .sort((a, b) => b.votos - a.votos || a.nome.localeCompare(b.nome, "pt-BR"));

  return { itens, totalVotos };
}

export type SaldoNucleo = {
  nucleoId: string;
  nucleoNome: string;
  devido: number;
  sinalNecessario: number;
  pago: number;
  saldo: number;
  situacao: "QUITADO" | "SINAL_PAGO" | "PARCIAL" | "PENDENTE";
  pagamentos: { id: string; valor: number; tipo: string; metodo: string; pagoEm: Date; observacao: string }[];
};

export async function obterSaldos(rateio: Rateio): Promise<SaldoNucleo[]> {
  const pagamentos = await prisma.pagamento.findMany({
    include: { nucleo: true },
    orderBy: { pagoEm: "desc" },
  });

  const linhas = new Map<string, SaldoNucleo>();

  for (const linha of rateio.nucleos) {
    if (!linha.nucleoId) continue;
    linhas.set(linha.nucleoId, {
      nucleoId: linha.nucleoId,
      nucleoNome: linha.nucleoNome,
      devido: linha.valor,
      sinalNecessario: linha.sinal,
      pago: 0,
      saldo: linha.valor,
      situacao: "PENDENTE",
      pagamentos: [],
    });
  }

  for (const pagamento of pagamentos) {
    const atual =
      linhas.get(pagamento.nucleoId) ??
      ({
        nucleoId: pagamento.nucleoId,
        nucleoNome: pagamento.nucleo.nome,
        devido: 0,
        sinalNecessario: 0,
        pago: 0,
        saldo: 0,
        situacao: "PENDENTE",
        pagamentos: [],
      } satisfies SaldoNucleo);

    atual.pago += pagamento.valor;
    atual.pagamentos.push({
      id: pagamento.id,
      valor: pagamento.valor,
      tipo: pagamento.tipo,
      metodo: pagamento.metodo,
      pagoEm: pagamento.pagoEm,
      observacao: pagamento.observacao,
    });
    linhas.set(pagamento.nucleoId, atual);
  }

  return [...linhas.values()]
    .map((linha) => {
      const saldo = Math.round((linha.devido - linha.pago) * 100) / 100;
      const situacao: SaldoNucleo["situacao"] =
        linha.devido > 0 && saldo <= 0
          ? "QUITADO"
          : linha.pago >= linha.sinalNecessario && linha.pago > 0
            ? "SINAL_PAGO"
            : linha.pago > 0
              ? "PARCIAL"
              : "PENDENTE";
      return { ...linha, saldo, situacao };
    })
    .sort((a, b) => a.nucleoNome.localeCompare(b.nucleoNome, "pt-BR"));
}
