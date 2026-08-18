import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const createDb = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL が設定されていません。");
  }

  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
  });

  return drizzle({ client, schema });
};

const globalForDb = globalThis as typeof globalThis & {
  __syowaIntraDb?: ReturnType<typeof createDb>;
};

export const db = globalForDb.__syowaIntraDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__syowaIntraDb = db;
}
