"use client";

import { useFormStatus } from "react-dom";

export function BotaoAcao({
  children,
  confirmar,
  className = "botao-suave px-3 py-2 text-sm",
}: {
  children: React.ReactNode;
  confirmar?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(evento) => {
        if (confirmar && !window.confirm(confirmar)) evento.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
