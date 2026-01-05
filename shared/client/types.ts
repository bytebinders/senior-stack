import { z } from "zod";

/* =======================
   User Types
======================= */

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.enum(["reporter", "admin"]),
  createdAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

/* =======================
   Report Types
======================= */

export const ReportSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.enum(["pending", "reviewed", "closed"]),
  createdAt: z.string().optional(),
});

export type Report = z.infer<typeof ReportSchema>;

/* =======================
   Request Types
======================= */

export const CreateReportRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
});

export type CreateReportRequest = z.infer<
  typeof CreateReportRequestSchema
>;

export const UpdateReportStatusRequestSchema = z.object({
  status: z.enum(["pending", "reviewed", "closed"]),
});

export type UpdateReportStatusRequest = z.infer<
  typeof UpdateReportStatusRequestSchema
>;

