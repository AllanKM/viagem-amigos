import { STATUS_ROTULOS } from "@/lib/dados";

const ESTILOS: Record<string, string> = {
  CONFIRMADO: "bg-folha-100 text-folha-600",
  TALVEZ: "bg-sol-100 text-sol-500",
  NAO_VAI: "bg-coral-100 text-coral-600",
  PENDENTE: "bg-areia-200 text-oceano-700",
};

const PONTOS: Record<string, string> = {
  CONFIRMADO: "bg-folha-500",
  TALVEZ: "bg-sol-500",
  NAO_VAI: "bg-coral-500",
  PENDENTE: "bg-oceano-700/40",
};

export function SeloStatus({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span className={`selo ${ESTILOS[status] ?? ESTILOS.PENDENTE} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${PONTOS[status] ?? PONTOS.PENDENTE}`} />
      {STATUS_ROTULOS[status] ?? status}
    </span>
  );
}
