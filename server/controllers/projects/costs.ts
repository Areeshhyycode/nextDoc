import type { Request, Response } from "express";
import { projectCosts, insertProjectCostSchema } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getProjectCostsHandler(req: Request, res: Response) {
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

export async function createProjectCostHandler(req: Request, res: Response) {
  try {
    const validatedData = insertProjectCostSchema.parse(req.body);
    const [cost] = await db
      .insert(projectCosts)
      .values(validatedData)
      .returning();
    res.status(201).json(cost);
  } catch (error) {
    console.error("Error creating cost:", error);
    res.status(500).json({ message: "Failed to create cost" });
  }
}

export async function deleteProjectCostHandler(req: Request, res: Response) {
  try {
    await db
      .delete(projectCosts)
      .where(eq(projectCosts.id, req.params.id));
    res.status(200).json({ message: "Cost deleted successfully" });
  } catch (error) {
    console.error("Error deleting cost:", error);
    res.status(500).json({ message: "Failed to delete cost" });
  }
}
