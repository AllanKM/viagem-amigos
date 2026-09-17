import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_ORGANIZADOR = "bf_organizador";
const COOKIE_IDENTIDADE = "bf_eu";
const UM_ANO = 60 * 60 * 24 * 365;

const pinConfigurado = () => process.env.ORGANIZADOR_PIN ?? "buzios2026";
const segredo = () => process.env.APP_SECRET ?? "segredo-local-buzios";

function assinatura() {
  return createHmac("sha256", segredo()).update(`organizador:${pinConfigurado()}`).digest("hex");
}

function iguais(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function pinCorreto(pin: string) {
  return iguais(pin.trim(), pinConfigurado());
}

export async function ehOrganizador() {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE_ORGANIZADOR)?.value;
  return Boolean(valor) && iguais(valor!, assinatura());
}

export async function abrirSessaoOrganizador() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_ORGANIZADOR, assinatura(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: UM_ANO,
  });
}

export async function fecharSessaoOrganizador() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ORGANIZADOR);
}

/** Identidade do participante: definida quando ele clica na própria foto. */
export async function idDoParticipante() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_IDENTIDADE)?.value ?? null;
}

export async function definirParticipante(amigoId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_IDENTIDADE, amigoId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: UM_ANO,
  });
}

export async function limparParticipante() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_IDENTIDADE);
}
