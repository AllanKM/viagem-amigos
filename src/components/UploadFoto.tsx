"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/Avatar";

const LADO_MAXIMO = 520;

/** Reduz a imagem no próprio celular antes de enviar, para não subir arquivo gigante. */
async function reduzirImagem(arquivo: File): Promise<Blob> {
  if (typeof document === "undefined") return arquivo;

  const bitmap = await createImageBitmap(arquivo).catch(() => null);
  if (!bitmap) return arquivo;

  const lado = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = LADO_MAXIMO;
  canvas.height = LADO_MAXIMO;

  const contexto = canvas.getContext("2d");
  if (!contexto) return arquivo;

  // Recorte quadrado central, que é como a foto aparece na grade.
  contexto.drawImage(
    bitmap,
    (bitmap.width - lado) / 2,
    (bitmap.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO_MAXIMO,
    LADO_MAXIMO,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? arquivo), "image/jpeg", 0.85);
  });
}

export function UploadFoto({
  amigoId,
  nome,
  sobrenome,
  fotoUrl,
}: {
  amigoId: string;
  nome: string;
  sobrenome: string;
  fotoUrl: string | null;
}) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState(fotoUrl);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    setEnviando(true);
    try {
      const reduzida = await reduzirImagem(arquivo);
      const corpo = new FormData();
      corpo.append("amigoId", amigoId);
      corpo.append("arquivo", new File([reduzida], "foto.jpg", { type: "image/jpeg" }));

      const resposta = await fetch("/api/foto", { method: "POST", body: corpo });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Não conseguimos salvar a foto.");

      setPrevia(dados.fotoUrl);
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não conseguimos salvar a foto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar nome={nome} sobrenome={sobrenome} fotoUrl={previa} tamanho="gg" />
      <div>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={enviando}
          className="botao-suave px-4 py-2 text-sm"
        >
          {enviando ? "Enviando…" : previa ? "Trocar minha foto" : "Enviar minha foto"}
        </button>
        <p className="mt-1.5 text-xs text-oceano-800/60">
          A foto aparece na grade para todos te reconhecerem. Pode tirar na hora pelo celular.
        </p>
        {erro && <p className="mt-1 text-xs font-semibold text-coral-600">{erro}</p>}
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(evento) => {
            const arquivo = evento.target.files?.[0];
            if (arquivo) void enviar(arquivo);
            evento.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
