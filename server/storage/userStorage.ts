import {
  users,
  userSessions,
  activityLogs,
  invitations,
  type User,
  type InsertUser,
  type UpdateUser,
  type UserSession,
  type InsertUserSession,
  type ActivityLog,
  type InsertActivityLog,
  type Invitation,
  type InsertInvitation,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IUserStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  updateUserLastLogin(id: string): Promise<User>;
  updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(id: string): Promise<User | undefined>;

  // Admin functionality
  updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined>;
  updateUserActivity(id: string): Promise<User | undefined>;
  getOnlineUsers(): Promise<User[]>;
  getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // User Sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateSessionActivity(sessionId: string): Promise<UserSession | undefined>;
  deactivateUserSessions(userId: string): Promise<void>;
  getActiveUserSessions(): Promise<UserSession[]>;

  // Activity Logs
  logActivity(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<ActivityLog[]>;
  getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]>;

  // Invitations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitations(): Promise<Invitation[]>;
  getInvitationByEmail(email: string): Promise<Invitation | undefined>;
}

export class UserStorage implements IUserStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserLastLogin(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        lastLogin: sql`CURRENT_TIMESTAMP`,
        isOnline: true,
        lastActivity: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserResetToken(id: string, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.resetToken, token),
        sql`${users.resetTokenExpiry} > NOW()`
      ));
    return user || undefined;
  }

  async clearResetToken(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Admin functionality
  async updateUserRole(id: string, role: 'user' | 'admin' | 'sub-admin'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isOnline,
        lastActivity: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserActivity(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastActivity: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getOnlineUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isOnline, true))
      .orderBy(desc(users.lastActivity));
  }

  async getUsersByRole(role: 'user' | 'admin' | 'sub-admin'): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // User Sessions
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSessionActivity(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db
      .update(userSessions)
      .set({ lastActivity: sql`CURRENT_TIMESTAMP` })
      .where(eq(userSessions.sessionId, sessionId))
      .returning();
    return session || undefined;
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  async getActiveUserSessions(): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.lastActivity));
  }

  // Activity Logs
  async logActivity(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getActivityLogs(options: { userId?: string; action?: string; limit?: number; offset?: number } = {}): Promise<ActivityLog[]> {
    const whereConditions = [];

    if (options.userId) {
      whereConditions.push(eq(activityLogs.userId, options.userId));
    }

    if (options.action) {
      whereConditions.push(eq(activityLogs.action, options.action));
    }

    const baseQuery = db.select().from(activityLogs);

    const queryWithWhere = whereConditions.length > 0
      ? baseQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      : baseQuery;

    const queryWithOrder = queryWithWhere.orderBy(desc(activityLogs.timestamp));

    const queryWithLimit = options.limit
      ? queryWithOrder.limit(options.limit)
      : queryWithOrder;

    const finalQuery = options.offset
      ? queryWithLimit.offset(options.offset)
      : queryWithLimit;

    return await finalQuery;
  }

  async getUserLoginStats(): Promise<{ userId: string; displayName: string; email: string; lastLogin: Date; loginCount: number; }[]> {
    const result = await db
      .select({
        userId: users.id,
        displayName: users.displayName,
        email: users.email,
        lastLogin: users.lastLogin,
        loginCount: sql<number>`COUNT(${activityLogs.id})`.as('loginCount')
      })
      .from(users)
      .leftJoin(activityLogs, and(
        eq(users.id, activityLogs.userId),
        eq(activityLogs.action, 'login')
      ))
      .groupBy(users.id, users.displayName, users.email, users.lastLogin)
      .orderBy(desc(users.lastLogin));

    return result.map(row => ({
      ...row,
      lastLogin: row.lastLogin || new Date(),
      loginCount: row.loginCount || 0
    }));
  }

  // Invitation methods
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db.insert(invitations).values(invitation).returning();
    return newInvitation;
  }

  async getInvitations(): Promise<Invitation[]> {
    return await db.select().from(invitations).orderBy(desc(invitations.createdAt));
  }

  async getInvitationByEmail(email: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.email, email));
    return invitation || undefined;
  }
}

export const userStorage = new UserStorage();
