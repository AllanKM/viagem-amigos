import Image from "next/image";

import praiaGeriba from "../../public/praia-geriba.jpg";

/** Moldura com a foto da praia de Geribá ao fundo e um véu para o texto continuar legível. */
export function FundoPraia({
  children,
  className = "",
  prioridade = false,
  veu = "from-oceano-900/65 via-oceano-800/35 to-mar-700/50",
}: {
  children: React.ReactNode;
  className?: string;
  prioridade?: boolean;
  veu?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={praiaGeriba}
        alt="Praia de Geribá, em Búzios"
        fill
        sizes="(max-width: 768px) 100vw, 900px"
        placeholder="blur"
        priority={prioridade}
        className="object-cover"
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${veu}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Onda que costura a foto com o bloco de baixo. A cor vem de `className` (text-*). */
export function OndaBranca({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-full ${className}`}
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d="M0 26c120-22 240 22 360 0s240-22 360 0 240 22 480 0v14H0z" fill="currentColor" />
    </svg>
  );
}
