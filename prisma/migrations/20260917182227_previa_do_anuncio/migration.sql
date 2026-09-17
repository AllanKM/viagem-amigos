-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Casa" (
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
    "previaTitulo" TEXT NOT NULL DEFAULT '',
    "previaResumo" TEXT NOT NULL DEFAULT '',
    "previaImagem" TEXT NOT NULL DEFAULT '',
    "previaNota" REAL,
    "previaBuscadaEm" DATETIME,
    "alerta" TEXT NOT NULL DEFAULT '',
    "indisponivel" BOOLEAN NOT NULL DEFAULT false,
    "motivoIndisponivel" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Casa_cotacaoDataId_fkey" FOREIGN KEY ("cotacaoDataId") REFERENCES "OpcaoData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Casa" ("alerta", "arCondicionado", "atualizadoEm", "avaliacoes", "banheiros", "camas", "capacidade", "churrasqueira", "cotacaoDataId", "criadoEm", "custosObrigatorios", "distanciaPraia", "estacionamento", "extras", "fotoUrl", "hospedesCotacao", "id", "indisponivel", "link", "motivoIndisponivel", "nome", "notaAirbnb", "ordem", "piscina", "precoAConfirmar", "quartos", "regiao", "regras", "valorTotal") SELECT "alerta", "arCondicionado", "atualizadoEm", "avaliacoes", "banheiros", "camas", "capacidade", "churrasqueira", "cotacaoDataId", "criadoEm", "custosObrigatorios", "distanciaPraia", "estacionamento", "extras", "fotoUrl", "hospedesCotacao", "id", "indisponivel", "link", "motivoIndisponivel", "nome", "notaAirbnb", "ordem", "piscina", "precoAConfirmar", "quartos", "regiao", "regras", "valorTotal" FROM "Casa";
DROP TABLE "Casa";
ALTER TABLE "new_Casa" RENAME TO "Casa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
