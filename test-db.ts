import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function testConnection() {
  try {
    const result = await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful:", result);
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();