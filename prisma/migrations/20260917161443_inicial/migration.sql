-- CreateTable
CREATE TABLE "Viagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nome" TEXT NOT NULL DEFAULT 'Búzios em Família 2026',
    "destino" TEXT NOT NULL DEFAULT 'Búzios, RJ',
    "regioesPreferidas" TEXT NOT NULL DEFAULT 'Ferradura, Geribá, Manguinhos',
    "descricao" TEXT NOT NULL DEFAULT '',
    "orcamentoMaximo" REAL NOT NULL DEFAULT 7000,
    "metaPessoas" INTEGER NOT NULL DEFAULT 24,
    "minPessoas" INTEGER NOT NULL DEFAULT 20,
    "prazoConfirmacao" DATETIME NOT NULL,
    "prazoVotacao" DATETIME NOT NULL,
    "rodadaVotacao" INTEGER NOT NULL DEFAULT 1,
    "votacaoAberta" BOOLEAN NOT NULL DEFAULT true,
    "casaEscolhidaId" TEXT,
    "idadeIsenta" INTEGER NOT NULL DEFAULT 5,
    "idadeMeia" INTEGER NOT NULL DEFAULT 12,
    "fatorMeia" REAL NOT NULL DEFAULT 0.5,
    "percentualSinal" INTEGER NOT NULL DEFAULT 30,
    "chavePix" TEXT NOT NULL DEFAULT '',
    "nomeRecebedorPix" TEXT NOT NULL DEFAULT '',
    "avisoGeral" TEXT NOT NULL DEFAULT '',
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OpcaoData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rotulo" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "noites" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Nucleo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Amigo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL DEFAULT '',
    "fotoUrl" TEXT,
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "nucleoId" TEXT,
    "organizador" BOOLEAN NOT NULL DEFAULT false,
    "naLista" BOOLEAN NOT NULL DEFAULT true,
    "adulto" BOOLEAN NOT NULL DEFAULT true,
    "idade" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "preferenciaDataId" TEXT,
    "observacoes" TEXT NOT NULL DEFAULT '',
    "aceiteCompromisso" BOOLEAN NOT NULL DEFAULT false,
    "respondidoEm" DATETIME,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "responsavelId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Amigo_nucleoId_fkey" FOREIGN KEY ("nucleoId") REFERENCES "Nucleo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Amigo_preferenciaDataId_fkey" FOREIGN KEY ("preferenciaDataId") REFERENCES "OpcaoData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Amigo_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Amigo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Casa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "link" TEXT NOT NULL DEFAULT '',
    "fotoUrl" TEXT NOT NULL DEFAULT '',
    "regiao" TEXT NOT NULL DEFAULT '',
    "capacidade" INTEGER NOT NULL DEFAULT 0,
    "quartos" INTEGER NOT NULL DEFAULT 0,
    "camas" INTEGER NOT NULL DEFAULT 0,
    "banheiros" INTEGER NOT NULL DEFAULT 0,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "churrasqueira" BOOLEAN NOT NULL DEFAULT false,
    "arCondicionado" BOOLEAN NOT NULL DEFAULT false,
    "estacionamento" BOOLEAN NOT NULL DEFAULT false,
    "extras" TEXT NOT NULL DEFAULT '',
    "distanciaPraia" TEXT NOT NULL DEFAULT '',
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "precoAConfirmar" BOOLEAN NOT NULL DEFAULT false,
    "hospedesCotacao" INTEGER,
    "cotacaoDataId" TEXT,
    "custosObrigatorios" TEXT NOT NULL DEFAULT '',
    "regras" TEXT NOT NULL DEFAULT '',
    "notaAirbnb" REAL,
    "avaliacoes" INTEGER,
    "alerta" TEXT NOT NULL DEFAULT '',
    "indisponivel" BOOLEAN NOT NULL DEFAULT false,
    "motivoIndisponivel" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Casa_cotacaoDataId_fkey" FOREIGN KEY ("cotacaoDataId") REFERENCES "OpcaoData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amigoId" TEXT NOT NULL,
    "casaId" TEXT NOT NULL,
    "rodada" INTEGER NOT NULL DEFAULT 1,
    "comentario" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Voto_amigoId_fkey" FOREIGN KEY ("amigoId") REFERENCES "Amigo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voto_casaId_fkey" FOREIGN KEY ("casaId") REFERENCES "Casa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustoExtra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL DEFAULT 0,
    "incluirNoRateio" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nucleoId" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'SINAL',
    "metodo" TEXT NOT NULL DEFAULT 'PIX',
    "pagoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT NOT NULL DEFAULT '',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pagamento_nucleoId_fkey" FOREIGN KEY ("nucleoId") REFERENCES "Nucleo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Nucleo_nome_key" ON "Nucleo"("nome");

-- CreateIndex
CREATE INDEX "Amigo_nucleoId_idx" ON "Amigo"("nucleoId");

-- CreateIndex
CREATE INDEX "Amigo_responsavelId_idx" ON "Amigo"("responsavelId");

-- CreateIndex
CREATE INDEX "Voto_casaId_idx" ON "Voto"("casaId");

-- CreateIndex
CREATE UNIQUE INDEX "Voto_amigoId_rodada_key" ON "Voto"("amigoId", "rodada");

-- CreateIndex
CREATE INDEX "Pagamento_nucleoId_idx" ON "Pagamento"("nucleoId");
