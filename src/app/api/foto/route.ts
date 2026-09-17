import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { ehOrganizador, idDoParticipante } from "@/lib/sessao";

const TAMANHO_MAXIMO = 6 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const amigoId = String(formData.get("amigoId") ?? "");
  const arquivo = formData.get("arquivo");

  if (!amigoId || !(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Envio incompleto." }, { status: 400 });
  }

  if (!TIPOS.includes(arquivo.type)) {
    return NextResponse.json({ erro: "Use uma imagem JPG, PNG ou WEBP." }, { status: 415 });
  }

  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Imagem muito grande (máximo 6 MB)." }, { status: 413 });
  }

  const amigo = await prisma.amigo.findUnique({ where: { id: amigoId } });
  if (!amigo) return NextResponse.json({ erro: "Pessoa não encontrada." }, { status: 404 });

  // Cada um troca a própria foto; o organizador pode ajustar a de qualquer pessoa.
  const [meuId, organizador] = await Promise.all([idDoParticipante(), ehOrganizador()]);
  if (!organizador && meuId !== amigoId) {
    return NextResponse.json(
      { erro: "Clique na sua foto na página de presença antes de enviar a imagem." },
      { status: 403 },
    );
  }

  const extensao = arquivo.type === "image/png" ? "png" : arquivo.type === "image/webp" ? "webp" : "jpg";
  const nomeArquivo = `${amigoId}-${Date.now()}.${extensao}`;
  const pasta = path.join(process.cwd(), "public", "uploads");

  await mkdir(pasta, { recursive: true });
  await writeFile(path.join(pasta, nomeArquivo), Buffer.from(await arquivo.arrayBuffer()));

  const fotoUrl = `/uploads/${nomeArquivo}`;
  await prisma.amigo.update({ where: { id: amigoId }, data: { fotoUrl } });

  revalidatePath("/");
  revalidatePath("/presenca");
  revalidatePath(`/presenca/${amigoId}`);
  revalidatePath("/casas");

  return NextResponse.json({ ok: true, fotoUrl });
}
