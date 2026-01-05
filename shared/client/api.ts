import { z } from "zod";
import {
  UserSchema,
  ReportSchema,
  CreateReportRequestSchema,
  UpdateReportStatusRequestSchema,
} from "./types";

/* =======================
   Error Schemas
======================= */

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

/* =======================
   Input Schemas
======================= */

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["reporter", "admin"]).optional(),
});

export const insertReportSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
});

/* =======================
   API Definition
======================= */

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: UserSchema,
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: UserSchema,
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: UserSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },

  users: {
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(UserSchema),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/users",
      input: insertUserSchema,
      responses: {
        201: UserSchema,
        400: errorSchemas.validation,
      },
    },
  },

  reports: {
    list: {
      method: "GET" as const,
      path: "/api/reports",
      input: z
        .object({
          status: z.enum(["pending", "reviewed", "closed"]).optional(),
          category: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(ReportSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/reports/:id",
      responses: {
        200: ReportSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/reports",
      input: CreateReportRequestSchema,
      responses: {
        201: ReportSchema,
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: "PATCH" as const,
      path: "/api/reports/:id/status",
      input: UpdateReportStatusRequestSchema,
      responses: {
        200: ReportSchema,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/reports/:id",
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

/* =======================
   Utils
======================= */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }

  return url;
}
