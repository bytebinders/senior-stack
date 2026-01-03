import { users, reports, type User, type InsertUser, type Report, type InsertReportRequest, type UpdateReportStatusRequest } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;
  generateResetToken(userId: number): Promise<string>;
  validateResetToken(token: string): Promise<number | null>;

  getReports(filter?: { status?: 'pending' | 'reviewed' | 'closed'; category?: string }): Promise<Report[]>;
  getReportsByReporter(reporterId: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: CreateReportRequest & { reporterId: number }): Promise<Report>;
  updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'closed'): Promise<Report | undefined>;
  deleteReport(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private async getDb() {
    const mod = await import("./db");
    return mod.db;
  }

  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.getDb();
    return await db.select().from(users).orderBy(users.id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async generateResetToken(_userId: number): Promise<string> {
    // For database storage, this would generate a token and store it
    // For now, return a placeholder
    return "token-" + Date.now();
  }

  async validateResetToken(_token: string): Promise<number | null> {
    // For database storage, this would validate against stored tokens
    return null;
  }

  async getReports(filter?: { status?: 'pending' | 'reviewed' | 'closed'; category?: string }): Promise<Report[]> {
    const db = await this.getDb();
    let query = db.select().from(reports);
    const conditions: any[] = [];

    if (filter?.status) {
      conditions.push(eq(reports.status, filter.status));
    }
    if (filter?.category) {
      conditions.push(eq(reports.category, filter.category));
    }

    if (conditions.length > 0) {
      const [allReports] = await Promise.all([db.select().from(reports).orderBy(desc(reports.createdAt))]);
      return allReports.filter(r => {
        if (filter?.status && r.status !== filter.status) return false;
        if (filter?.category && r.category !== filter.category) return false;
        return true;
      });
    }

    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReportsByReporter(reporterId: number): Promise<Report[]> {
    const db = await this.getDb();
    return await db.select().from(reports).where(eq(reports.reporterId, reporterId)).orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const db = await this.getDb();
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(report: CreateReportRequest & { reporterId: number }): Promise<Report> {
    const db = await this.getDb();
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'closed'): Promise<Report | undefined> {
    const db = await this.getDb();
    const [updatedReport] = await db
      .update(reports)
      .set({ status: status as any })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteReport(id: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(reports).where(eq(reports.id, id));
  }
}

// In-memory storage for quick local viewing without Postgres
class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private reports: Report[] = [];
  private resetTokens: Map<string, { userId: number; expiresAt: number }> = new Map();
  private userId = 1;
  private reportId = 1;

  async getUser(id: number) {
    return this.users.find(u => u.id === id);
  }
  async getUserByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }
  async getAllUsers() { return this.users; }
  async createUser(insertUser: InsertUser) {
    const user: any = { ...insertUser, id: this.userId++ };
    this.users.push(user);
    return user;
  }
  async updateUserPassword(userId: number, newPassword: string) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return undefined;
    user.password = newPassword;
    return user;
  }
  async generateResetToken(userId: number): Promise<string> {
    const token = `reset-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Token expires in 1 hour
    this.resetTokens.set(token, { userId, expiresAt: Date.now() + 3600000 });
    return token;
  }
  async validateResetToken(token: string): Promise<number | null> {
    const resetData = this.resetTokens.get(token);
    if (!resetData) return null;
    if (resetData.expiresAt < Date.now()) {
      this.resetTokens.delete(token);
      return null;
    }
    return resetData.userId;
  }
  async getReports(filter?: { status?: 'pending' | 'reviewed' | 'closed'; category?: string }) {
    return this.reports.filter(r => {
      if (filter?.status && r.status !== filter.status) return false;
      if (filter?.category && r.category !== filter.category) return false;
      return true;
    });
  }
  async getReportsByReporter(reporterId: number) { return this.reports.filter(r => r.reporterId === reporterId); }
  async getReport(id: number) { return this.reports.find(r => r.id === id); }
  async createReport(report: CreateReportRequest & { reporterId: number }) {
    const newReport: any = { 
      ...report, 
      id: this.reportId++, 
      createdAt: new Date(),
      status: report.status || 'pending'
    };
    this.reports.push(newReport);
    return newReport;
  }
  async updateReportStatus(id: number, status: 'pending' | 'reviewed' | 'closed') {
    const r = this.reports.find(r => r.id === id);
    if (!r) return undefined;
    r.status = status;
    return r;
  }
  async deleteReport(id: number) { this.reports = this.reports.filter(r => r.id !== id); }
}

const storageInstance: IStorage = process.env.USE_IN_MEMORY === '1' ? new InMemoryStorage() : new DatabaseStorage();

export const storage = storageInstance;
