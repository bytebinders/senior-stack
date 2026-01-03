import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // This will be the email
  password: text("password").notNull(),
  role: text("role", { enum: ["reporter", "admin"] }).default("reporter").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  status: text("status", { enum: ["pending", "reviewed", "closed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  title: true,
  description: true,
  category: true,
  location: true,
  status: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type CreateReportRequest = Omit<InsertReport, "status">; // Status defaults to pending
export type UpdateReportStatusRequest = { status: "pending" | "reviewed" | "closed" };
