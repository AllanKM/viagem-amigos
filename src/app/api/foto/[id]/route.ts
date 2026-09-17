import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/** Entrega a foto guardada no banco. A url leva ?v=<data> para o cache não segurar a versão antiga. */
export async function GET(_request: Request, { params }: RouteContext<"/api/foto/[id]">) {
  const { id } = await params;

  const amigo = await prisma.amigo.findUnique({
    where: { id },
    select: { fotoDados: true, fotoTipo: true },
  });

  if (!amigo?.fotoDados) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(amigo.fotoDados), {
    headers: {
      "content-type": amigo.fotoTipo ?? "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
