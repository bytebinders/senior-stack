import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertReportSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication first. When using in-memory storage for quick local
  // viewing, avoid importing Postgres-backed auth (which requires DATABASE_URL).
  if (process.env.USE_IN_MEMORY === '1') {
    // In-memory mode: session tracking for login/logout
    const sessions = new Map<string, any>();
    
    app.use((req: any, _res: any, next: any) => {
      // Check if user has a session from cookie or header
      const sessionId = req.cookies['x-session-id'] || req.headers['x-session-id'];
      if (sessionId && sessions.has(sessionId)) {
        req.isAuthenticated = () => true;
        req.user = sessions.get(sessionId);
      } else {
        req.isAuthenticated = () => false;
        req.user = null;
      }
      next();
    });

    // Auth endpoints for in-memory mode
    app.post("/api/register", async (req, res) => {
      try {
        const { username, password, role } = req.body;
        if (!username || !password || password.length < 6) {
          return res.status(400).json({ message: "Invalid username or password" });
        }
        const existing = await storage.getUserByUsername(username);
        if (existing) {
          return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await storage.createUser({ username, password: hashedPassword, role: role || 'reporter' });
        const { password: _, ...safeUser } = user as any;
        
        // Create session for the new user
        const sessionId = `session-${Date.now()}-${Math.random()}`;
        sessions.set(sessionId, safeUser);
        res.cookie('x-session-id', sessionId, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
        
        res.status(201).json({ ...safeUser, sessionId });
      } catch (err) {
        res.status(500).json({ message: "Registration failed" });
      }
    });

    app.post("/api/login", async (req, res) => {
      try {
        const { username, password } = req.body;
        if (!username || !password) {
          return res.status(400).json({ message: "Username and password required" });
        }
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        // Create session
        const sessionId = `session-${Date.now()}-${Math.random()}`;
        const { password: _, ...safeUser } = user as any;
        sessions.set(sessionId, safeUser);
        res.cookie('x-session-id', sessionId, { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000, path: '/' });
        res.status(200).json({ ...safeUser, sessionId });
      } catch (err) {
        res.status(500).json({ message: "Login failed" });
      }
    });

    app.post("/api/logout", (req: any, res) => {
      const sessionId = req.cookies['x-session-id'] || req.headers['x-session-id'];
      if (sessionId) {
        sessions.delete(sessionId);
      }
      res.clearCookie('x-session-id');
      res.sendStatus(200);
    });

    app.get("/api/user", (req: any, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      res.json(req.user);
    });
  } else {
    const { setupAuth } = await import("./auth");
    setupAuth(app);
  }

  // Seed Data (attempt; on DB error trigger fallback to in-memory)
  try {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await storage.createUser({ username: 'admin', password: hashedPassword, role: 'admin' });
    }

    const existingReporter = await storage.getUserByUsername('reporter');
    if (!existingReporter) {
      const hashedPassword = await bcrypt.hash('reporter123', 10);
      const user = await storage.createUser({ username: 'reporter', password: hashedPassword, role: 'reporter' });

      // Seed reports
      await storage.createReport({ title: "Vandalism in Park", description: "Graffiti on the bench near the north entrance.", category: "Vandalism", location: "North Entrance", reporterId: user.id });
      await storage.createReport({ title: "Suspicious Activity", description: "Two individuals loitering around the back alley at 2 AM.", category: "Suspicious Behavior", location: "Back Alley", reporterId: user.id });
    }
  } catch (err: any) {
    console.error("Database seeding failed:", err?.message || err);
    // Make index.ts detect this and fallback to in-memory storage
    const fallbackErr = new Error("Database unavailable for seeding");
    (fallbackErr as any).code = "ENOTFOUND";
    throw fallbackErr;
  }

  // Reports API

  // GET /api/reports - List reports (Admin: all, Reporter: own?)
  // User req: "Reporter: View submitted reports", "Admin: View all reports"
  app.get(api.reports.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (req.user!.role === 'admin') {
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status as string;
      if (req.query.category) filter.category = req.query.category as string;
      const reports = await storage.getReports(filter);
      return res.json(reports);
    } else {
      // Reporter only sees their own
      const reports = await storage.getReportsByReporter(req.user!.id);
      return res.json(reports);
    }
  });

  // GET /api/reports/:id
  app.get(api.reports.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const report = await storage.getReport(id);

    if (!report) return res.sendStatus(404);

    // Authorization check
    if (req.user!.role !== 'admin' && report.reporterId !== req.user!.id) {
      return res.sendStatus(403);
    }

    res.json(report);
  });

  // POST /api/reports
  app.post(api.reports.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'reporter') return res.status(403).json({ message: "Only reporters can submit reports" });

    try {
      const data = api.reports.create.input.parse(req.body);
      const report = await storage.createReport({
        ...data,
        reporterId: req.user!.id,
      });
      res.status(201).json(report);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // PATCH /api/reports/:id/status
  app.patch(api.reports.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.sendStatus(403);

    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pending', 'reviewed', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await storage.updateReportStatus(id, status);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // DELETE /api/reports/:id
  app.delete(api.reports.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.sendStatus(403);

    const id = parseInt(req.params.id);
    const report = await storage.getReport(id);
    if (!report) return res.sendStatus(404);

    await storage.deleteReport(id);
    res.sendStatus(200);
  });

  // Users API (Admin only)

  // GET /api/users - List all users (Admin only)
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.status(403).json({ message: "Only admins can list users" });

    const allUsers = await storage.getAllUsers();
    // Don't send passwords
    const safeUsers = allUsers.map(({ ...user }) => {
      const { password, ...safe } = user as any;
      return safe;
    });
    res.json(safeUsers);
  });

  // POST /api/users - Create new user (Admin only)
  app.post(api.users.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.status(403).json({ message: "Only admins can create users" });

    try {
      const { username, password, role } = api.users.create.input.parse(req.body);

      // Check if user already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        role,
      });

      // Don't send password
      const { password: _, ...safeUser } = newUser as any;
      res.status(201).json(safeUser);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: e.errors });
      } else {
        throw e;
      }
    }
  });

  // Password Reset Endpoints
  app.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = await storage.generateResetToken(user.id);
      // In production, send this token via email
      // For now, we're returning it in the response for testing
      res.status(200).json({ 
        message: "Password reset token generated",
        token // Only for development/testing
      });
    } catch (err) {
      res.status(500).json({ message: "Password reset request failed" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Invalid token or password" });
      }

      const userId = await storage.validateResetToken(token);
      if (!userId) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await storage.updateUserPassword(userId, hashedPassword);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  return httpServer;
}
