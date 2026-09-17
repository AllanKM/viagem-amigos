"use client";

import { useActionState } from "react";

type Estado = { ok: boolean; mensagem: string } | null;

/**
 * Formulário genérico do painel: recebe uma ação de servidor e cuida do estado de
 * envio e da mensagem de retorno, para não repetir isso em cada seção.
 */
export function FormAcao({
  acao,
  textoBotao,
  textoEnviando = "Salvando…",
  estiloBotao = "botao-primario",
  children,
  className = "",
}: {
  acao: (estado: Estado, formData: FormData) => Promise<Estado>;
  textoBotao: string;
  textoEnviando?: string;
  estiloBotao?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [estado, enviar, pendente] = useActionState<Estado, FormData>(acao, null);

  return (
    <form action={enviar} className={`space-y-3 ${className}`}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pendente} className={`${estiloBotao} px-5 py-2.5 text-sm`}>
          {pendente ? textoEnviando : textoBotao}
        </button>
        {estado && (
          <p
            role="status"
            className={`text-sm font-medium ${estado.ok ? "text-folha-600" : "text-coral-600"}`}
          >
            {estado.mensagem}
          </p>
        )}
      </div>
    </form>
  );
}
