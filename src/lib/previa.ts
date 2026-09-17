import { prisma } from "@/lib/prisma";

/** Sem cara de navegador o Airbnb devolve página sem as marcações do anúncio. */
const NAVEGADOR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** Uma semana: o anúncio muda pouco e a página não deve depender do site externo. */
const VALIDADE = 7 * 24 * 60 * 60 * 1000;

export type Previa = {
  titulo: string;
  resumo: string;
  imagem: string;
  nota: number | null;
  site: string;
};

export type CasaComPrevia = {
  id: string;
  link: string;
  previaTitulo: string;
  previaResumo: string;
  previaImagem: string;
  previaNota: number | null;
  previaBuscadaEm: Date | null;
};

const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  bull: "•",
  middot: "·",
  laquo: "«",
  raquo: "»",
  deg: "°",
  ordf: "ª",
  ordm: "º",
  szlig: "ß",
  aring: "å",
  oslash: "ø",
};

/** &atilde; &eacute; &ccedil;… viram letra + acento combinante e depois um só caractere. */
const ACENTOS: Record<string, string> = {
  grave: "\u0300",
  acute: "\u0301",
  circ: "\u0302",
  tilde: "\u0303",
  uml: "\u0308",
  ring: "\u030a",
  cedil: "\u0327",
};

const PADRAO_ENTIDADE = /&(#x?[0-9a-f]+|[a-z]+);/i;

/** Alguns anúncios vêm com entidade dentro de entidade ("&amp;nbsp;"). */
function decodificar(valor: string) {
  const primeira = decodificarUmaVez(valor);
  return PADRAO_ENTIDADE.test(primeira) ? decodificarUmaVez(primeira) : primeira;
}

function decodificarUmaVez(valor: string) {
  return valor
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (inteiro, codigo: string) => {
      const chave = codigo.toLowerCase();
      if (ENTIDADES[chave]) return ENTIDADES[chave];
      if (chave.startsWith("#x")) return String.fromCodePoint(Number.parseInt(chave.slice(2), 16));
      if (chave.startsWith("#")) return String.fromCodePoint(Number(chave.slice(1)));

      const acentuada = codigo.match(/^([a-zA-Z])(grave|acute|circ|tilde|uml|ring|cedil)$/);
      if (acentuada) return (acentuada[1] + ACENTOS[acentuada[2].toLowerCase()]).normalize("NFC");

      return inteiro;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** Cabe em um cartão; o texto inteiro do anúncio não interessa aqui. */
const encurtar = (valor: string) => (valor.length > 240 ? `${valor.slice(0, 239).trimEnd()}…` : valor);

function metaTag(html: string, propriedade: string) {
  const comConteudoDepois = new RegExp(
    `<meta[^>]+(?:property|name)=["']${propriedade}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const comConteudoAntes = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${propriedade}["']`,
    "i",
  );
  const achado = html.match(comConteudoDepois) ?? html.match(comConteudoAntes);
  return achado ? decodificar(achado[1]) : "";
}

/** O Airbnb põe a nota no título, como "★4,95". */
function extrairNota(titulo: string) {
  const achado = titulo.match(/★\s*(\d+[.,]\d+)/);
  if (!achado) return null;
  const nota = Number(achado[1].replace(",", "."));
  return Number.isFinite(nota) && nota > 0 && nota <= 5 ? nota : null;
}

export function siteDoLink(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Lê as marcações Open Graph do anúncio. Serve para Airbnb, Booking e afins. */
export async function buscarPrevia(link: string): Promise<Previa | null> {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const resposta = await fetch(url, {
    headers: {
      "user-agent": NAVEGADOR,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "pt-BR,pt;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) return null;

  // O que interessa está no <head>; o resto do anúncio é peso desnecessário.
  const html = (await resposta.text()).slice(0, 300_000);
  // Sites sem Open Graph (alguns imobiliários) só têm <title> e description.
  const titulo =
    metaTag(html, "og:title") ||
    metaTag(html, "twitter:title") ||
    decodificar(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const resumo = metaTag(html, "og:description") || metaTag(html, "description");
  const imagem = metaTag(html, "og:image") || metaTag(html, "twitter:image");
  if (!titulo && !resumo && !imagem) return null;

  return {
    titulo: encurtar(titulo),
    resumo: encurtar(resumo),
    imagem,
    nota: extrairNota(titulo),
    site: siteDoLink(link),
  };
}

function daCasa(casa: CasaComPrevia): Previa | null {
  if (!casa.previaTitulo && !casa.previaResumo && !casa.previaImagem) return null;
  return {
    titulo: casa.previaTitulo,
    resumo: casa.previaResumo,
    imagem: casa.previaImagem,
    nota: casa.previaNota,
    site: siteDoLink(casa.link),
  };
}

/**
 * Devolve a prévia guardada e, quando ela está velha ou nunca foi buscada, vai
 * buscar no anúncio e guarda. Se o site falhar, mantém o que já havia.
 */
export async function garantirPrevia(casa: CasaComPrevia): Promise<Previa | null> {
  const guardada = daCasa(casa);
  const naValidade =
    casa.previaBuscadaEm !== null && Date.now() - casa.previaBuscadaEm.getTime() < VALIDADE;

  if (!casa.link || naValidade) return guardada;

  let nova: Previa | null = null;
  try {
    nova = await buscarPrevia(casa.link);
  } catch {
    nova = null;
  }

  try {
    await prisma.casa.update({
      where: { id: casa.id },
      // A data entra mesmo quando falha, para não tentar de novo a cada acesso.
      data: {
        previaBuscadaEm: new Date(),
        ...(nova
          ? {
              previaTitulo: nova.titulo,
              previaResumo: nova.resumo,
              previaImagem: nova.imagem,
              previaNota: nova.nota,
            }
          : {}),
      },
    });
  } catch {
    // Guardar é só otimização: seguir mostrando a prévia é mais importante.
  }

  return nova ?? guardada;
}
