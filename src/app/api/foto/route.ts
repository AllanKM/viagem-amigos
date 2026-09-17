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

  // A imagem fica no próprio banco: assim funciona igual no computador e na Vercel,
  // que não guarda arquivos gravados em tempo de execução.
  const fotoUrl = `/api/foto/${amigoId}?v=${Date.now()}`;
  await prisma.amigo.update({
    where: { id: amigoId },
    data: {
      fotoDados: Buffer.from(await arquivo.arrayBuffer()),
      fotoTipo: arquivo.type,
      fotoUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/presenca");
  revalidatePath(`/presenca/${amigoId}`);
  revalidatePath("/casas");
  revalidatePath("/organizador");

  return NextResponse.json({ ok: true, fotoUrl });
}
