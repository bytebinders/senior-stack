import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/* =======================
   Database Connection
======================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/* =======================
   Drizzle Instance
======================= */

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV !== "production",
});
