import {
  teams,
  viewPreferences,
  kanbanColumns,
  projects,
  type Team,
  type InsertTeam,
  type UpdateTeam,
  type ViewPreference,
  type KanbanColumn,
  type InsertKanbanColumn,
  type UpdateKanbanColumn,
} from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { wasDeleted } from "./helpers";

export interface ITeamStorage {
  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // View Preferences
  getViewPreference(userId: string, teamId: string): Promise<ViewPreference | undefined>;
  setViewPreference(userId: string, teamId: string, viewType: 'table' | 'kanban'): Promise<ViewPreference>;

  // Kanban Columns
  getKanbanColumns(teamId: string): Promise<KanbanColumn[]>;
  createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn>;
  updateKanbanColumn(id: string, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined>;
  deleteKanbanColumn(id: string): Promise<boolean>;
  updateProjectColumn(projectId: string, columnName: string): Promise<void>;
}

export class TeamStorage implements ITeamStorage {
  // Teams methods
  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.createdAt);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, updates: UpdateTeam): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam || undefined;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return wasDeleted(result);
  }

  // View Preferences Implementation
  async getViewPreference(userId: string, teamId: string): Promise<ViewPreference | undefined> {
    const [preference] = await db
      .select()
      .from(viewPreferences)
      .where(and(
        eq(viewPreferences.userId, userId),
        eq(viewPreferences.teamId, teamId)
      ));
    return preference || undefined;
  }

  async setViewPreference(userId: string, teamId: string, viewType: 'table' | 'kanban'): Promise<ViewPreference> {
    // Check if preference exists
    const existing = await this.getViewPreference(userId, teamId);

    if (existing) {
      // Update existing preference
      const [updated] = await db
        .update(viewPreferences)
        .set({ viewType, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(
          eq(viewPreferences.userId, userId),
          eq(viewPreferences.teamId, teamId)
        ))
        .returning();
      return updated;
    } else {
      // Create new preference
      const [created] = await db
        .insert(viewPreferences)
        .values({ userId, teamId, viewType })
        .returning();
      return created;
    }
  }

  // Kanban Columns Implementation
  async getKanbanColumns(teamId: string): Promise<KanbanColumn[]> {
    // Fetch existing columns
    const columns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.teamId, teamId))
      .orderBy(kanbanColumns.order);

    // Lazy create default columns if none exist
    if (columns.length === 0) {
      const defaultColumns = [
        { teamId, name: 'New task', color: '#8B5CF6', icon: '📋', order: 0, isDefault: true },
        { teamId, name: 'Scheduled', color: '#3B82F6', icon: '📅', order: 1, isDefault: true },
        { teamId, name: 'In Progress', color: '#F59E0B', icon: '🔨', order: 2, isDefault: true },
        { teamId, name: 'Completed', color: '#10B981', icon: '✅', order: 3, isDefault: true },
      ];

      for (const column of defaultColumns) {
        await db.insert(kanbanColumns).values(column);
      }

      // Fetch and return the newly created columns
      const newColumns = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.teamId, teamId))
        .orderBy(kanbanColumns.order);

      return newColumns;
    }

    return columns;
  }

  async createKanbanColumn(column: InsertKanbanColumn): Promise<KanbanColumn> {
    const [newColumn] = await db
      .insert(kanbanColumns)
      .values(column)
      .returning();
    return newColumn;
  }

  async updateKanbanColumn(id: string, updates: UpdateKanbanColumn): Promise<KanbanColumn | undefined> {
    const [updated] = await db
      .update(kanbanColumns)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(kanbanColumns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteKanbanColumn(id: string): Promise<boolean> {
    const result = await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id));
    return wasDeleted(result);
  }

  async updateProjectColumn(projectId: string, columnName: string): Promise<void> {
    // This method updates the project's status or notes to reflect its kanban column
    // For now, we'll just update the project to mark it as updated
    await db
      .update(projects)
      .set({ lastUpdated: sql`CURRENT_TIMESTAMP` })
      .where(eq(projects.id, projectId));
  }
}

export const teamStorage = new TeamStorage();
