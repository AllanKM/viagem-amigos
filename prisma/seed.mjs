import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

// Mesma regra do app: com TURSO_DATABASE_URL semeia o banco na nuvem, senão o arquivo local.
const prisma = process.env.TURSO_DATABASE_URL
  ? new PrismaClient({
      adapter: new PrismaLibSQL({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    })
  : new PrismaClient();

const data = (iso) => new Date(`${iso}T12:00:00-03:00`);

async function main() {
  await prisma.viagem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: "Búzios em Família 2026",
      destino: "Búzios, RJ",
      regioesPreferidas: "Ferradura, Geribá, Manguinhos",
      descricao:
        "Casa inteira e independente, com churrasqueira, para o nosso grupo de 20 a 24 pessoas. Viagem e transporte não entram no rateio.",
      orcamentoMaximo: 7000,
      metaPessoas: 24,
      minPessoas: 20,
      prazoConfirmacao: data("2026-10-15"),
      prazoVotacao: data("2026-10-05"),
      idadeIsenta: 5,
      idadeMeia: 12,
      fatorMeia: 0.5,
      percentualSinal: 30,
      avisoGeral:
        "A reserva só é garantida depois do sinal. Quem não confirmar até o prazo entra na lista de espera.",
    },
  });

  const datas = [
    {
      rotulo: "16 a 19 de dezembro de 2026",
      inicio: data("2026-12-16"),
      fim: data("2026-12-19"),
      noites: 3,
      ordem: 1,
    },
    {
      rotulo: "18 a 21 de dezembro de 2026",
      inicio: data("2026-12-18"),
      fim: data("2026-12-21"),
      noites: 3,
      ordem: 2,
    },
  ];

  for (const opcao of datas) {
    const existente = await prisma.opcaoData.findFirst({ where: { rotulo: opcao.rotulo } });
    if (!existente) await prisma.opcaoData.create({ data: opcao });
  }

  const primeiraData = await prisma.opcaoData.findFirst({ orderBy: { ordem: "asc" } });

  // Cada candidata entra só se o link ainda não estiver cadastrado, então dá para
  // acrescentar casas novas sem desfazer o que o organizador já ajustou na mão.
  const casas = [
    {
      nome: "Casa Búzios | Piscina, Jacuzzi, Sauna, 5 Suítes",
      link: "https://www.airbnb.com.br/rooms/913590595354183536",
      regiao: "Próximo a Geribá e Porto da Barra",
      capacidade: 15,
      quartos: 5,
      camas: 10,
      banheiros: 7,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "Jacuzzi, Sauna, Salão de jogos",
      distanciaPraia: "Curta distância de Geribá e Porto da Barra",
      valorTotal: 6678,
      hospedesCotacao: 15,
      cotacaoDataId: primeiraData?.id ?? null,
      alerta:
        "Não serve sozinha para 20 a 24 pessoas. Só deve ser escolhida se o grupo final tiver até 15 pessoas ou se houver uma segunda casa.",
      ordem: 1,
    },
    {
      nome: "Casa da Luna | Pé na areia em Geribá, 7 suítes",
      link: "https://www.airbnb.com.br/rooms/1726018685385866160",
      regiao: "Geribá (canto direito, pé na areia)",
      capacidade: 21,
      quartos: 7,
      camas: 15,
      banheiros: 9,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "Salão de jogos (sinuca e ping-pong), cozinha industrial, vista mar",
      distanciaPraia: "Pé na areia",
      precoAConfirmar: true,
      hospedesCotacao: 21,
      cotacaoDataId: primeiraData?.id ?? null,
      regras: "Churrasqueira portátil na área gourmet externa.",
      alerta:
        "Capacidade de 21 pessoas em camas: atende o grupo se fecharmos até 21. Preço para dezembro ainda precisa ser confirmado no anúncio.",
      ordem: 2,
    },
    {
      nome: "Búzios Prime | Vista mar, 50 m da Ferradura, 8 suítes",
      link: "https://www.airbnb.com.br/rooms/21024055",
      regiao: "Ferradura",
      capacidade: 20,
      quartos: 8,
      banheiros: 8,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "Sauna a vapor, salão de jogos, espaço gourmet, 3 salas de estar, lareira",
      distanciaPraia: "50 m da praia da Ferradura",
      precoAConfirmar: true,
      regras:
        "Anúncio informa água, luz, gás, taxas, roupa de cama/banho e Wi-Fi inclusos. Acomoda 20 hóspedes e aceita até 30 com taxa adicional.",
      alerta:
        "Boa candidata para 20 a 24 pessoas (acima de 20 há taxa extra por hóspede). Confirmar preço das datas em votação.",
      ordem: 3,
    },
    {
      nome: "Mansão na Marina | 8 suítes, 24 hóspedes",
      link: "https://alugoportemporada.com.br/casa-temporada/684699-mansao-na-marina-com-8-suites-e-chef-decozinha",
      regiao: "Região da Marina, Búzios",
      capacidade: 24,
      quartos: 8,
      camas: 15,
      banheiros: 10,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "Piscina adulto e infantil, sinuca, área gastronômica com chef, forno de pizza",
      distanciaPraia: "3 minutos a pé da praia",
      precoAConfirmar: true,
      regras: "Anúncio fora do Airbnb: negociação direta com o proprietário.",
      alerta:
        "Única opção que cobre as 24 pessoas com folga. Preço e disponibilidade para dezembro precisam ser negociados direto.",
      ordem: 4,
    },
    {
      nome: "Mansão pé na areia | Ferradura, 10 quartos",
      link: "https://www.experienciaembuzios.com.br/detalhes-imovel/219-casa-temporada-ferradura-armacao-dos-buzios-rj.html",
      regiao: "Ferradura (pé na areia)",
      capacidade: 20,
      quartos: 10,
      banheiros: 8,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "8 suítes, jardim com vista para o mar, lavanderia, 5 vagas",
      distanciaPraia: "Pé na areia",
      precoAConfirmar: true,
      custosObrigatorios:
        "Casal de caseiros obrigatório (R$ 500 por dia), água (R$ 29,99/m³) e luz (R$ 1,35/kWh) por consumo, caução de R$ 300 por dia.",
      regras: "Check-in 10h e check-out 14h. Roupa de cama e banho inclusas, sem trocas.",
      alerta:
        "Atenção: os custos obrigatórios de caseiros e consumo entram no rateio e podem pesar mais que a diária.",
      ordem: 5,
    },
    {
      nome: "Casa dos Sonhos | Beira-mar, 8 suítes",
      link: "https://www.airbnb.com.br/rooms/2945076",
      regiao: "Praia do Canto, perto da Rua das Pedras",
      capacidade: 16,
      quartos: 8,
      camas: 11,
      banheiros: 8,
      piscina: false,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: false,
      extras: "Frente mar, 7 suítes com vista, Wi-Fi com dois provedores",
      distanciaPraia: "Pé na areia",
      precoAConfirmar: true,
      custosObrigatorios: "Casal de caseiros obrigatório, cerca de R$ 400 a R$ 440 por noite.",
      regras: "Valor é para 16 pessoas, com máximo de 18 pagando hóspede adicional. Há dois cães na casa.",
      alerta: "Capacidade insuficiente para 20 a 24 pessoas. Fica como reserva caso o grupo diminua.",
      ordem: 6,
    },
    {
      nome: "Mansão 11 suítes | 30 m da Ferradura",
      link: "https://agilizaimobiliaria.sites.robustcrm.com.br/imovel/casa_11_quartos--ferradura--armacao_dos_buzios--rj--locacao--cod-303",
      regiao: "Ferradura",
      capacidade: 24,
      quartos: 11,
      banheiros: 11,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "Sauna, jacuzzi, forno de pizza, piscina em 3 níveis com bar molhado, 10 vagas",
      distanciaPraia: "30 m do acesso à areia",
      precoAConfirmar: true,
      indisponivel: true,
      motivoIndisponivel:
        "Diária a partir de R$ 7.000: três noites passariam de R$ 21.000, muito acima do orçamento de R$ 7.000 para a casa.",
      alerta: "Registrada apenas para comparação. Fora do orçamento atual.",
      ordem: 7,
    },
    {
      nome: "Casa Geribá 56 | 9 quartos, até 24 hóspedes",
      link: "https://airbnb.com/h/casageriba56",
      regiao: "Geribá (700 m do canto direito)",
      capacidade: 24,
      quartos: 9,
      banheiros: 7,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "7 suítes e 2 quartos, hidro, piscina com deck molhado, salão de jogos, espaço gourmet",
      distanciaPraia: "700 m de Geribá (8 minutos a pé)",
      valorTotal: 12600,
      precoAConfirmar: true,
      hospedesCotacao: 21,
      cotacaoDataId: primeiraData?.id ?? null,
      custosObrigatorios:
        "Diária de R$ 2.950 mais R$ 250 por dia para cada hóspede acima de 16 (21 pessoas dão R$ 4.200 por noite). Luz por consumo a R$ 1,35/kWh, caução de R$ 500. Roupa de cama e banho opcional a R$ 37,50 por pessoa.",
      regras:
        "Máximo de 24 pessoas, contando crianças (abaixo de 4 anos não pagam). Check-in 10h e check-out 14h. Não aceita pets nem grupo de jovens sem responsável.",
      alerta:
        "Cabe as 21 pessoas com folga e a diária de dezembro está publicada, mas confirme no Airbnb do anfitrião (casageriba56) o valor exato das nossas datas.",
      ordem: 8,
    },
    {
      nome: "Belíssimo refúgio em Geribá (BZ36) | 9 quartos, até 25 hóspedes",
      link: "https://www.temporadalivre.com/aluguel-temporada/brasil/rio-de-janeiro/armacao-dos-buzios/geriba/140867-lb-bz36-belissimo-refugio-em-geriba-aluguel-de-temporada",
      regiao: "Geribá (Rua Casuarina)",
      capacidade: 25,
      quartos: 9,
      banheiros: 9,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "7 suítes e 2 quartos, salão de jogos com pebolim e ping-pong, mesa de 14 lugares, piscina com espreguiçadeiras",
      distanciaPraia: "Menos de 10 minutos a pé de Geribá",
      valorTotal: 8700,
      precoAConfirmar: true,
      hospedesCotacao: 21,
      cotacaoDataId: primeiraData?.id ?? null,
      custosObrigatorios:
        "Diária anunciada de R$ 2.900 (R$ 8.700 nas três noites), mais 2 funcionários obrigatórios a R$ 200 por dia cada, energia por consumo e caução.",
      regras:
        "Até 25 pessoas incluindo crianças, com taxa por pessoa acima de 15 (crianças até 4 anos não contam). Mínimo de 2 diárias. Proibido festas e convidados de fora.",
      alerta:
        "A candidata mais barata que cabe 21 pessoas, mas a diária publicada é a de temporada comum: pedir cotação de dezembro e a taxa por pessoa acima de 15.",
      ordem: 9,
    },
    {
      nome: "Mansão 9 suítes na Ferradura | 25 hóspedes",
      link: "https://alugoportemporada.com.br/casa-temporada/677244-mansao-completa-com-9-amplas-suites-na-praia-da-ferradura",
      regiao: "Ferradura (Rua Georgina de Albuquerque)",
      capacidade: 25,
      quartos: 9,
      camas: 22,
      banheiros: 11,
      piscina: true,
      churrasqueira: true,
      arCondicionado: true,
      estacionamento: true,
      extras: "9 suítes, academia, vista para o mar, 12 cadeiras de praia, 5 vagas",
      distanciaPraia: "Na Ferradura, a poucos metros da praia",
      precoAConfirmar: true,
      regras: "Aceita animais. Anúncio fora do Airbnb: negociação direta com o proprietário.",
      alerta:
        "Capacidade sobra para 21 pessoas, mas o anúncio não publica preço e o calendário está sem atualizar desde junho de 2025: confirmar se ainda aluga.",
      ordem: 10,
    },
  ];

  for (const casa of casas) {
    const existente = await prisma.casa.findFirst({ where: { link: casa.link } });
    if (!existente) await prisma.casa.create({ data: casa });
  }

  await semearFamilia();
}

/**
 * Lista oficial da família, agrupada por núcleo (é por núcleo que o rateio e os
 * pagamentos são cobrados). Quem tem `crianca: true` entra como criança e paga
 * meia cota enquanto a idade não for informada na confirmação de presença.
 */
const FAMILIA = [
  {
    nucleo: "Família Allan",
    pessoas: [
      { nome: "Allan", organizador: true },
      { nome: "Paula" },
      { nome: "Catarina", crianca: true },
      { nome: "Allane" },
    ],
  },
  {
    nucleo: "Família Carol",
    pessoas: [
      { nome: "Carol" },
      { nome: "Henrique" },
      { nome: "Giovana", crianca: true },
      { nome: "Davi", crianca: true },
    ],
  },
  {
    nucleo: "Família Danielle",
    pessoas: [{ nome: "Danielle" }, { nome: "Bernardo", crianca: true }, { nome: "Bellinha" }],
  },
  { nucleo: "Família Victor", pessoas: [{ nome: "Victor" }, { nome: "Vera" }] },
  { nucleo: "Família Darci", pessoas: [{ nome: "Darci" }, { nome: "Rosy" }] },
  { nucleo: "Tia Fátima", pessoas: [{ nome: "Tia Fátima" }] },
  {
    nucleo: "Família Marquinhos",
    pessoas: [
      { nome: "Marquinhos" },
      { nome: "Rejane" },
      { nome: "Raffinha", crianca: true },
      { nome: "Manu", crianca: true },
    ],
  },
];

async function semearFamilia() {
  let ordemNucleo = 0;
  let ordemPessoa = 0;

  for (const grupo of FAMILIA) {
    ordemNucleo += 1;
    const nucleo = await prisma.nucleo.upsert({
      where: { nome: grupo.nucleo },
      update: { ordem: ordemNucleo },
      create: { nome: grupo.nucleo, ordem: ordemNucleo },
    });

    for (const pessoa of grupo.pessoas) {
      ordemPessoa += 1;
      // Só o que define a lista oficial: resposta, foto e idade seguem do participante.
      const dados = {
        nucleoId: nucleo.id,
        organizador: pessoa.organizador === true,
        adulto: pessoa.crianca !== true,
        naLista: true,
        ordem: ordemPessoa,
      };

      const existente = await prisma.amigo.findFirst({ where: { nome: pessoa.nome, naLista: true } });
      if (existente) await prisma.amigo.update({ where: { id: existente.id }, data: dados });
      else await prisma.amigo.create({ data: { nome: pessoa.nome, sobrenome: "", ...dados } });
    }
  }

  await limparNucleosVazios();
}

/** Quando alguém troca de núcleo, o antigo pode ficar sem ninguém: some da lista. */
async function limparNucleosVazios() {
  const vazios = await prisma.nucleo.findMany({
    where: { amigos: { none: {} }, pagamentos: { none: {} } },
    select: { id: true, nome: true },
  });

  for (const nucleo of vazios) {
    await prisma.nucleo.delete({ where: { id: nucleo.id } });
    console.log(`Núcleo sem gente removido: ${nucleo.nome}`);
  }
}

main()
  .then(() => console.log("Seed concluído."))
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
