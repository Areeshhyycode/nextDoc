import type { Request, Response } from "express";
import { projectBudgets } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getBudgetsDirectHandler(req: Request, res: Response) {
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

export async function createBudgetDirectHandler(req: Request, res: Response) {
  try {
    const { projectId, name, type, amount, currency, billDate, category, description } = req.body;
    const [budget] = await db
      .insert(projectBudgets)
      .values({ projectId, name, type, amount, currency: currency || "USD", billDate, category, description })
      .returning();
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Failed to create budget" });
  }
}
