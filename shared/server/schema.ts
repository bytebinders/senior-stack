import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =======================
   Enums
======================= */

export const roleEnum = pgEnum("role", ["reporter", "admin"]);
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "closed",
]);

/* =======================
   Users Table
======================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("reporter"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* =======================
   Reports Table
======================= */

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
