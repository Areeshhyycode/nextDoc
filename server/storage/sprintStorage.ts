import {
  sprints,
  projects,
  type Sprint,
  type InsertSprint,
  type UpdateSprint,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { wasDeleted } from "./helpers";

export interface ISprintStorage {
  // Sprints
  getAllSprints(): Promise<Sprint[]>;
  getSprint(id: string): Promise<Sprint | undefined>;
  createSprint(sprint: InsertSprint): Promise<Sprint>;
  updateSprint(id: string, updates: UpdateSprint): Promise<Sprint | undefined>;
  deleteSprint(id: string): Promise<boolean>;
  getSprintProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progressPercentage: number;
  }>;
  assignTasksToSprint(sprintId: string, taskIds: string[]): Promise<void>;
  autoAssignTasksToSprint(sprintId: string, criteria: {
    departments?: string[];
    maxEffort?: number;
    prioritizeBy?: 'risk' | 'dueDate' | 'effort';
  }): Promise<string[]>; // Returns assigned task IDs
  updateSprintProgress(sprintId: string): Promise<void>;
}

export class SprintStorage implements ISprintStorage {
  // Sprint Management Methods
  async getAllSprints(): Promise<Sprint[]> {
    return await db
      .select()
      .from(sprints)
      .orderBy(desc(sprints.createdAt));
  }

  async getSprint(id: string): Promise<Sprint | undefined> {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, id));
    return sprint || undefined;
  }

  async createSprint(insertSprint: InsertSprint): Promise<Sprint> {
    const [sprint] = await db
      .insert(sprints)
      .values(insertSprint)
      .returning();
    return sprint;
  }

  async updateSprint(id: string, updates: UpdateSprint): Promise<Sprint | undefined> {
    const [sprint] = await db
      .update(sprints)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(sprints.id, id))
      .returning();
    return sprint || undefined;
  }

  async deleteSprint(id: string): Promise<boolean> {
    // Remove sprint assignments from tasks first
    await db.update(projects).set({ sprintId: null }).where(eq(projects.sprintId, id));
    const result = await db.delete(sprints).where(eq(sprints.id, id));
    return wasDeleted(result);
  }

  async getSprintProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progressPercentage: number;
  }> {
    const sprint = await this.getSprint(id);
    if (!sprint || !sprint.taskIds || sprint.taskIds.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalEffort: 0,
        completedEffort: 0,
        progressPercentage: 0
      };
    }

    const sprintTasks = await db
      .select()
      .from(projects)
      .where(sql`${projects.id} = ANY(${sprint.taskIds})`);

    const totalTasks = sprintTasks.length;
    const completedTasks = sprintTasks.filter(task => task.status === 'Completed').length;
    const totalEffort = sprintTasks.reduce((sum, task) => sum + (task.effortEstimate || 1), 0);
    const completedEffort = sprintTasks
      .filter(task => task.status === 'Completed')
      .reduce((sum, task) => sum + (task.effortEstimate || 1), 0);

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, totalEffort, completedEffort, progressPercentage };
  }

  async assignTasksToSprint(sprintId: string, taskIds: string[]): Promise<void> {
    // Update tasks to assign them to the sprint
    await db
      .update(projects)
      .set({ sprintId })
      .where(sql`${projects.id} = ANY(${taskIds})`);

    // Update sprint to include these task IDs
    const sprint = await this.getSprint(sprintId);
    if (sprint) {
      const existingTaskIds = sprint.taskIds || [];
      const allTaskIds = [...existingTaskIds, ...taskIds];
      const updatedTaskIds = Array.from(new Set(allTaskIds));
      await this.updateSprint(sprintId, { taskIds: updatedTaskIds });
    }
  }

  async autoAssignTasksToSprint(sprintId: string, criteria: {
    departments?: string[];
    maxEffort?: number;
    prioritizeBy?: 'risk' | 'dueDate' | 'effort';
  }): Promise<string[]> {
    const sprint = await this.getSprint(sprintId);
    if (!sprint) return [];

    // Build query conditions
    let whereConditions = sql`${projects.sprintId} IS NULL AND ${projects.status} != 'Completed'`;

    if (criteria.departments && criteria.departments.length > 0) {
      whereConditions = sql`${whereConditions} AND ${projects.department} = ANY(${criteria.departments})`;
    }

    // Get available tasks
    let availableTasks = await db
      .select()
      .from(projects)
      .where(whereConditions);

    // Sort by priority criteria
    switch (criteria.prioritizeBy) {
      case 'risk':
        availableTasks = availableTasks.sort((a, b) => {
          const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };
          return (riskOrder[b.risk as keyof typeof riskOrder] || 0) - (riskOrder[a.risk as keyof typeof riskOrder] || 0);
        });
        break;
      case 'dueDate':
        availableTasks = availableTasks.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'effort':
        availableTasks = availableTasks.sort((a, b) => (a.effortEstimate || 1) - (b.effortEstimate || 1));
        break;
    }

    // Select tasks within effort limit
    const selectedTasks: string[] = [];
    let totalEffort = 0;
    const maxEffortLimit = criteria.maxEffort || 50; // Default sprint capacity

    for (const task of availableTasks) {
      const taskEffort = task.effortEstimate || 1;
      if (totalEffort + taskEffort <= maxEffortLimit) {
        selectedTasks.push(task.id);
        totalEffort += taskEffort;
      }
    }

    // Assign selected tasks to sprint
    if (selectedTasks.length > 0) {
      await this.assignTasksToSprint(sprintId, selectedTasks);
    }

    return selectedTasks;
  }

  async updateSprintProgress(sprintId: string): Promise<void> {
    const progress = await this.getSprintProgress(sprintId);

    // Update sprint with calculated progress
    await db
      .update(sprints)
      .set({
        totalEffort: progress.totalEffort,
        completedEffort: progress.completedEffort,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(sprints.id, sprintId));
  }
}

export const sprintStorage = new SprintStorage();
