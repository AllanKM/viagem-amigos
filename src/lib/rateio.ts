import type { Amigo, CustoExtra, Viagem } from "@prisma/client";

export type Classe = "ADULTO" | "MEIA" | "ISENTA";

export type PessoaRateio = {
  id: string;
  nome: string;
  sobrenome: string;
  adulto: boolean;
  idade: number | null;
  status: string;
  nucleoId: string | null;
  nucleoNome: string;
  classe: Classe;
  cota: number;
};

export type LinhaNucleo = {
  nucleoId: string | null;
  nucleoNome: string;
  pessoas: PessoaRateio[];
  adultos: number;
  criancasMeia: number;
  criancasIsentas: number;
  cotas: number;
  valor: number;
  sinal: number;
};

export type Rateio = {
  valorCasa: number;
  valorExtras: number;
  total: number;
  cotas: number;
  valorPorCota: number;
  valorPorCotaMeia: number;
  adultos: number;
  criancasMeia: number;
  criancasIsentas: number;
  pessoas: number;
  percentualSinal: number;
  totalSinal: number;
  nucleos: LinhaNucleo[];
  extras: CustoExtra[];
};

type RegrasIdade = Pick<Viagem, "idadeIsenta" | "idadeMeia" | "fatorMeia">;

/** Adulto paga cota inteira; criança até `idadeIsenta` é isenta e até `idadeMeia` paga meia. */
export function classificarPessoa(
  pessoa: Pick<Amigo, "adulto" | "idade">,
  regras: RegrasIdade,
): { classe: Classe; cota: number } {
  if (pessoa.adulto) return { classe: "ADULTO", cota: 1 };

  const idade = pessoa.idade;
  if (idade === null || idade === undefined) return { classe: "MEIA", cota: regras.fatorMeia };
  if (idade <= regras.idadeIsenta) return { classe: "ISENTA", cota: 0 };
  if (idade <= regras.idadeMeia) return { classe: "MEIA", cota: regras.fatorMeia };
  return { classe: "ADULTO", cota: 1 };
}

export const STATUS_QUE_PAGAM = ["CONFIRMADO"];

type AmigoComNucleo = Amigo & { nucleo?: { id: string; nome: string } | null };

export function montarPessoas(
  amigos: AmigoComNucleo[],
  viagem: RegrasIdade,
  statusAceitos: string[] = STATUS_QUE_PAGAM,
): PessoaRateio[] {
  return amigos
    .filter((amigo) => statusAceitos.includes(amigo.status))
    .map((amigo) => {
      const { classe, cota } = classificarPessoa(amigo, viagem);
      return {
        id: amigo.id,
        nome: amigo.nome,
        sobrenome: amigo.sobrenome,
        adulto: amigo.adulto,
        idade: amigo.idade,
        status: amigo.status,
        nucleoId: amigo.nucleoId,
        nucleoNome: amigo.nucleo?.nome ?? "Sem núcleo definido",
        classe,
        cota,
      };
    });
}

export function calcularRateio(opcoes: {
  viagem: Viagem;
  pessoas: PessoaRateio[];
  valorCasa: number;
  extras: CustoExtra[];
}): Rateio {
  const { viagem, pessoas, valorCasa, extras } = opcoes;

  const valorExtras = extras
    .filter((extra) => extra.incluirNoRateio)
    .reduce((soma, extra) => soma + extra.valor, 0);

  const total = valorCasa + valorExtras;
  const cotas = pessoas.reduce((soma, pessoa) => soma + pessoa.cota, 0);
  const valorPorCota = cotas > 0 ? total / cotas : 0;

  const porNucleo = new Map<string, LinhaNucleo>();
  for (const pessoa of pessoas) {
    const chave = pessoa.nucleoId ?? "sem-nucleo";
    const linha =
      porNucleo.get(chave) ??
      ({
        nucleoId: pessoa.nucleoId,
        nucleoNome: pessoa.nucleoNome,
        pessoas: [],
        adultos: 0,
        criancasMeia: 0,
        criancasIsentas: 0,
        cotas: 0,
        valor: 0,
        sinal: 0,
      } satisfies LinhaNucleo);

    linha.pessoas.push(pessoa);
    if (pessoa.classe === "ADULTO") linha.adultos += 1;
    if (pessoa.classe === "MEIA") linha.criancasMeia += 1;
    if (pessoa.classe === "ISENTA") linha.criancasIsentas += 1;
    linha.cotas += pessoa.cota;
    porNucleo.set(chave, linha);
  }

  const nucleos = [...porNucleo.values()]
    .map((linha) => ({
      ...linha,
      valor: arredondar(linha.cotas * valorPorCota),
      sinal: arredondar(linha.cotas * valorPorCota * (viagem.percentualSinal / 100)),
    }))
    .sort((a, b) => a.nucleoNome.localeCompare(b.nucleoNome, "pt-BR"));

  return {
    valorCasa,
    valorExtras,
    total,
    cotas,
    valorPorCota: arredondar(valorPorCota),
    valorPorCotaMeia: arredondar(valorPorCota * viagem.fatorMeia),
    adultos: nucleos.reduce((soma, linha) => soma + linha.adultos, 0),
    criancasMeia: nucleos.reduce((soma, linha) => soma + linha.criancasMeia, 0),
    criancasIsentas: nucleos.reduce((soma, linha) => soma + linha.criancasIsentas, 0),
    pessoas: pessoas.length,
    percentualSinal: viagem.percentualSinal,
    totalSinal: arredondar(total * (viagem.percentualSinal / 100)),
    nucleos,
    extras,
  };
}

export function arredondar(valor: number) {
  return Math.round(valor * 100) / 100;
}

/**
 * Cotas usadas para estimar o valor por adulto nos cartões das casas: usa quem já
 * confirmou e, se ainda não houver confirmações, cai para a meta do grupo.
 */
export function cotasDeReferencia(cotasConfirmadas: number, viagem: Viagem, capacidadeCasa: number) {
  if (cotasConfirmadas > 0) return cotasConfirmadas;
  const referencia = capacidadeCasa > 0 ? Math.min(capacidadeCasa, viagem.metaPessoas) : viagem.metaPessoas;
  return referencia > 0 ? referencia : 1;
}
