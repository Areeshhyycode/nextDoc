import type { Request, Response } from "express";
import { storage } from "../../storage";
import { workspaceProjects } from "@shared/schema";
import { db } from "../../db";
import { eq, sql } from "drizzle-orm";

export async function updateWorkspaceProjectPutHandler(req: Request, res: Response) {
  try {
    const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;

    const project = await storage.updateWorkspaceProject(req.params.id, {
      name,
      color,
      startDate,
      endDate,
      privacy,
      memberIds,
      defaultLayout
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
}

export async function updateWorkspaceProjectPatchHandler(req: Request, res: Response) {
  try {
    const updates = req.body;
    const [project] = await db
      .update(workspaceProjects)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(workspaceProjects.id, req.params.id))
      .returning();

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
}
