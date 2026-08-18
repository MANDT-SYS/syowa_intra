// ============================================================
// drizzle.config.ts
// Drizzle Kit の設定（スキーマ生成・マイグレーション用）
//    Drizzleはクエリビルダーとして使い、スキーマはDBから取り込む（pull）運用。
// ============================================================
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit は Next.js の外で動くため、.env.local を明示的に読み込む
config({ path: ".env.local" });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",   // pull で生成される
  out: "./src/db",
  dbCredentials: {
    //url: process.env.DATABASE_URL!,
    url: process.env.DIRECT_URL!,
  },
  // Supabase内部のスキーマ（auth/storage等）を除外し、publicだけ取り込む
  schemaFilter: ["public"],
});