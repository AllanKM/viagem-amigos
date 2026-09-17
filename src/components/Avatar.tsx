import { iniciais } from "@/lib/formato";

const TAMANHOS = {
  p: "h-10 w-10 text-xs",
  m: "h-14 w-14 text-sm",
  g: "h-20 w-20 text-lg",
  gg: "h-24 w-24 text-2xl",
} as const;

const CORES = [
  "bg-mar-200 text-mar-700",
  "bg-coral-200 text-coral-600",
  "bg-sol-300 text-oceano-800",
  "bg-folha-100 text-folha-600",
  "bg-areia-300 text-oceano-800",
  "bg-mar-100 text-oceano-700",
];

function corDoNome(chave: string) {
  let soma = 0;
  for (const letra of chave) soma += letra.charCodeAt(0);
  return CORES[soma % CORES.length];
}

export function Avatar({
  nome,
  sobrenome = "",
  fotoUrl,
  tamanho = "m",
  className = "",
}: {
  nome: string;
  sobrenome?: string;
  fotoUrl?: string | null;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const base = `${TAMANHOS[tamanho]} shrink-0 overflow-hidden rounded-full border-2 border-white shadow-[0_6px_16px_-10px_rgba(8,37,46,0.7)] ${className}`;

  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fotoUrl} alt={`Foto de ${nome}`} className={`${base} object-cover`} />
    );
  }

  return (
    <span
      aria-hidden
      className={`${base} ${corDoNome(nome + sobrenome)} flex items-center justify-center font-semibold`}
    >
      {iniciais(nome, sobrenome)}
    </span>
  );
}
