import {
  goals,
  projects,
  type Goal,
  type InsertGoal,
  type UpdateGoal,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { wasDeleted } from "./helpers";

export interface IGoalStorage {
  // Goals
  getAllGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  getGoalProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }>;
  updateGoalProgress(goalId: string): Promise<void>;
}

export class GoalStorage implements IGoalStorage {
  // Goal Management Methods
  async getAllGoals(): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return wasDeleted(result);
  }

  async getGoalProgress(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }> {
    const goal = await this.getGoal(id);
    if (!goal || !goal.taskIds || goal.taskIds.length === 0) {
      return { totalTasks: 0, completedTasks: 0, progressPercentage: 0 };
    }

    const linkedTasks = await db
      .select()
      .from(projects)
      .where(sql`${projects.id} = ANY(${goal.taskIds})`);

    const totalTasks = linkedTasks.length;
    const completedTasks = linkedTasks.filter(task => task.status === 'Completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, progressPercentage };
  }

  async updateGoalProgress(goalId: string): Promise<void> {
    // This method is called when a task status changes
    // The progress calculation is done dynamically in getGoalProgress
    // We just update the goal's updatedAt timestamp to indicate recent activity
    await db
      .update(goals)
      .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(goals.id, goalId));
  }
}

export const goalStorage = new GoalStorage();
