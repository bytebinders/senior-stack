/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Check your .env.local file and ensure it contains a valid PostgreSQL connection string."
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
dbCredentials: {
  url: DATABASE_URL,
},
});
