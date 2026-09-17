export function BarraProgresso({
  valor,
  meta,
  talvez = 0,
  rotulo,
  tom = "escuro",
}: {
  valor: number;
  meta: number;
  talvez?: number;
  rotulo?: string;
  /** "claro" é para usar sobre a foto da praia. */
  tom?: "claro" | "escuro";
}) {
  const percentual = meta > 0 ? Math.min(100, (valor / meta) * 100) : 0;
  const percentualTalvez = meta > 0 ? Math.min(100 - percentual, (talvez / meta) * 100) : 0;
  const claro = tom === "claro";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className={`text-sm font-medium ${claro ? "text-white" : "text-oceano-700"}`}>
          {rotulo ?? `${valor} de ${meta} pessoas confirmadas`}
        </p>
        <p className={`font-display text-lg ${claro ? "text-white" : "text-mar-700"}`}>
          {Math.round(percentual)}%
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={meta}
        aria-label={rotulo ?? `${valor} de ${meta} pessoas confirmadas`}
        className={`flex h-3.5 w-full overflow-hidden rounded-full ${
          claro ? "bg-white/25 ring-1 ring-white/30" : "bg-areia-200"
        }`}
      >
        <div
          className={`h-full rounded-l-full transition-all duration-500 ${
            claro ? "bg-gradient-to-r from-mar-300 to-mar-500" : "bg-gradient-to-r from-mar-400 to-mar-600"
          }`}
          style={{ width: `${percentual}%` }}
        />
        {percentualTalvez > 0 && (
          <div
            className="h-full bg-sol-300 transition-all duration-500"
            style={{ width: `${percentualTalvez}%` }}
          />
        )}
      </div>
      {talvez > 0 && (
        <p className={`mt-1.5 text-xs ${claro ? "text-white/80" : "text-oceano-700/70"}`}>
          A faixa clara mostra {talvez} pessoa{talvez === 1 ? "" : "s"} em &ldquo;talvez&rdquo;.
        </p>
      )}
    </div>
  );
}
