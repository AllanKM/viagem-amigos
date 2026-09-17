// Aplica as migrações do Prisma no banco Turso usando o cliente libSQL.
// Dispensa a CLI do Turso, que no Windows só roda dentro do WSL.
//
// Uso: npm run turso:aplicar   (lê TURSO_DATABASE_URL e TURSO_AUTH_TOKEN do .env)
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "Defina TURSO_DATABASE_URL no arquivo .env (e TURSO_AUTH_TOKEN, se o banco exigir token).",
  );
  process.exit(1);
}

const cliente = createClient({ url, authToken });
const pastaMigracoes = path.join(process.cwd(), "prisma", "migrations");

const migracoes = readdirSync(pastaMigracoes, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name)
  .sort();

await cliente.executeMultiple(
  `CREATE TABLE IF NOT EXISTS _migracoes_aplicadas (
     nome TEXT PRIMARY KEY,
     aplicadaEm TEXT NOT NULL
   )`,
);

const jaAplicadas = new Set(
  (await cliente.execute("SELECT nome FROM _migracoes_aplicadas")).rows.map((linha) => linha.nome),
);

let novas = 0;
for (const migracao of migracoes) {
  if (jaAplicadas.has(migracao)) {
    console.log(`· ${migracao} já estava aplicada`);
    continue;
  }

  const sql = readFileSync(path.join(pastaMigracoes, migracao, "migration.sql"), "utf8");
  await cliente.executeMultiple(sql);
  await cliente.execute({
    sql: "INSERT INTO _migracoes_aplicadas (nome, aplicadaEm) VALUES (?, ?)",
    args: [migracao, new Date().toISOString()],
  });

  console.log(`✓ ${migracao} aplicada`);
  novas += 1;
}

const tabelas = await cliente.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
);

console.log(
  novas === 0
    ? "\nNada novo para aplicar."
    : `\n${novas} migração(ões) aplicada(s) no Turso.`,
);
console.log("Tabelas no banco:", tabelas.rows.map((linha) => linha.name).join(", "));
console.log("\nPróximo passo: npm run banco:semear (carrega viagem, datas e casas).");

cliente.close();
