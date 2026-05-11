import "server-only";
import { Pool } from "pg";

// コネクションプールを使い回す（サーバーレス環境でも効率的）
const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),       // 例: 5432
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === "true"
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;