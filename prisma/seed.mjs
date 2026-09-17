import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  if ((await prisma.casa.count()) === 0) {
    await prisma.casa.createMany({
      data: [
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
      ],
    });
  }

  if ((await prisma.amigo.count()) === 0) {
    const nucleo = await prisma.nucleo.upsert({
      where: { nome: "Família Allan" },
      update: {},
      create: { nome: "Família Allan", ordem: 1 },
    });

    await prisma.amigo.create({
      data: {
        nome: "Allan",
        sobrenome: "(organizador)",
        nucleoId: nucleo.id,
        organizador: true,
        ordem: 1,
      },
    });
  }
}

main()
  .then(() => console.log("Seed concluído."))
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
