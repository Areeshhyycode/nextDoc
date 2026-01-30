import type { Request, Response } from "express";
import { projectCosts } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getCostsDirectHandler(req: Request, res: Response) {
  try {
    const costs = await db
      .select()
      .from(projectCosts)
      .where(eq(projectCosts.projectId, req.params.projectId))
      .orderBy(desc(projectCosts.createdAt));
    res.json(costs);
  } catch (error) {
    console.error("Error fetching costs:", error);
    res.status(500).json({ message: "Failed to fetch costs" });
  }
}

export async function createCostDirectHandler(req: Request, res: Response) {
  try {
    const { projectId, name, type, amount, currency, date, category, description } = req.body;
    const [cost] = await db
      .insert(projectCosts)
      .values({ projectId, name, type, amount, currency: currency || "USD", date, category, description })
      .returning();
    res.status(201).json(cost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).json({ message: "Failed to create cost" });
  }
}

export async function updateCostDirectHandler(req: Request, res: Response) {
  try {
    const { name, type, amount, currency, date, category, description } = req.body;
    const [cost] = await db
      .update(projectCosts)
      .set({ name, type, amount, currency, date, category, description })
      .where(eq(projectCosts.id, req.params.id))
      .returning();

    if (!cost) {
      res.status(404).json({ message: "Cost not found" });
      return;
    }

    res.json(cost);
  } catch (error) {
    console.error("Error updating cost:", error);
    res.status(500).json({ message: "Failed to update cost" });
  }
}

export async function deleteCostDirectHandler(req: Request, res: Response) {
  try {
    const [cost] = await db
      .delete(projectCosts)
      .where(eq(projectCosts.id, req.params.id))
      .returning();

    if (!cost) {
      res.status(404).json({ message: "Cost not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting cost:", error);
    res.status(500).json({ message: "Failed to delete cost" });
  }
}
