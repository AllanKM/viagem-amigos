import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Em produção (Vercel) o banco é o Turso, acessado pelo adaptador libSQL.
 * Sem as variáveis do Turso, cai no arquivo SQLite local usado no desenvolvimento.
 */
function criarCliente() {
  const registro = process.env.NODE_ENV === "development" ? (["warn", "error"] as const) : (["error"] as const);
  const urlTurso = process.env.TURSO_DATABASE_URL;

  if (!urlTurso) return new PrismaClient({ log: [...registro] });

  const adapter = new PrismaLibSQL({
    url: urlTurso,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return new PrismaClient({ adapter, log: [...registro] });
}

export const prisma = globalParaPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
