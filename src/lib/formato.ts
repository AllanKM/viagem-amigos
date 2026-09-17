const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const moedaCurta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const reais = (valor: number) => moeda.format(Number.isFinite(valor) ? valor : 0);
export const reaisCurto = (valor: number) => moedaCurta.format(Number.isFinite(valor) ? valor : 0);

export function dataLonga(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));
}

export function dataCurta(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));
}

/** Formato aceito por <input type="date"> a partir de uma data do banco. */
export function paraInputDate(valor: Date | string | null | undefined) {
  if (!valor) return "";
  const d = new Date(valor);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function diasRestantes(prazo: Date | string) {
  const hoje = new Date();
  const alvo = new Date(prazo);
  const umDia = 86400000;
  const inicioHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioAlvo = Date.UTC(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  return Math.round((inicioAlvo - inicioHoje) / umDia);
}

export function textoPrazo(prazo: Date | string) {
  const dias = diasRestantes(prazo);
  if (dias > 1) return `faltam ${dias} dias`;
  if (dias === 1) return "termina amanhã";
  if (dias === 0) return "termina hoje";
  return `encerrado há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "dia" : "dias"}`;
}

export function iniciais(nome: string, sobrenome = "") {
  // Só letras: apelidos entre parênteses e pontuação não viram inicial.
  const palavras = `${nome} ${sobrenome}`.match(/\p{L}+/gu) ?? [];
  const primeira = palavras[0]?.charAt(0) ?? "";
  const segunda = palavras[1]?.charAt(0) ?? "";
  return `${primeira}${segunda}`.toUpperCase() || "?";
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function pluralizar(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

export function whatsappLink(numero: string) {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.startsWith("55") ? digitos : `55${digitos}`}`;
}
