import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

// ✅ Your working Supabase pooler URL
const DATABASE_URL = "postgresql://postgres.emszlbvbhaegbejtjmui:Bytebinder%40247@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

// Safety check
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize the pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Quick connection test
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Supabase connected at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Supabase connection failed:", err);
  }
})();

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });
