import type { Request, Response } from "express";
import { projectBudgets, insertProjectBudgetSchema } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getProjectBudgetsHandler(req: Request, res: Response) {
  try {
    const budgets = await db
      .select()
      .from(projectBudgets)
      .where(eq(projectBudgets.projectId, req.params.projectId))
      .orderBy(desc(projectBudgets.createdAt));
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
}

export async function createProjectBudgetHandler(req: Request, res: Response) {
  try {
    const validatedData = insertProjectBudgetSchema.parse(req.body);
    const [budget] = await db
      .insert(projectBudgets)
      .values(validatedData)
      .returning();
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Failed to create budget" });
  }
}

export async function deleteProjectBudgetHandler(req: Request, res: Response) {
  try {
    await db
      .delete(projectBudgets)
      .where(eq(projectBudgets.id, req.params.id));
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Failed to delete budget" });
  }
}
