"use client";

import { useActionState } from "react";

import { votar, type EstadoVoto } from "@/actions/votacao";

export function FormularioVoto({
  casaId,
  meuVoto,
  comentarioAtual,
  bloqueio,
}: {
  casaId: string;
  meuVoto: boolean;
  comentarioAtual: string;
  bloqueio: string | null;
}) {
  const [estado, acao, enviando] = useActionState<EstadoVoto, FormData>(votar, null);

  return (
    <form action={acao} className="mt-4 space-y-2 border-t border-areia-200 pt-4">
      <input type="hidden" name="casaId" value={casaId} />
      <input
        name="comentario"
        defaultValue={comentarioAtual}
        maxLength={280}
        placeholder="Comentário curto (opcional): o que te agrada ou preocupa nessa casa"
        className="campo py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={enviando || Boolean(bloqueio)}
        title={bloqueio ?? undefined}
        className={`${meuVoto ? "botao-suave border-mar-400 text-mar-700" : "botao-primario"} w-full`}
      >
        {enviando
          ? "Registrando…"
          : meuVoto
            ? "Este é o seu voto · atualizar comentário"
            : "Votar nesta casa"}
      </button>
      {bloqueio && <p className="text-xs text-oceano-800/60">{bloqueio}</p>}
      {estado && (
        <p
          role="status"
          className={`text-sm font-medium ${estado.ok ? "text-folha-600" : "text-coral-600"}`}
        >
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
