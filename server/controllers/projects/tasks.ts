import type { Request, Response } from "express";
import { insertProjectSchema, projects } from "@shared/schema";
import { db } from "../../db";
import { eq, desc, sql } from "drizzle-orm";

export async function getProjectTasksHandler(req: Request, res: Response) {
  try {
    const tasks = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceProjectId, req.params.projectId))
      .orderBy(desc(projects.createdAt));
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ message: "Failed to fetch project tasks" });
  }
}

export async function createProjectTaskHandler(req: Request, res: Response) {
  try {
    const taskData = {
      ...req.body,
      workspaceProjectId: req.params.projectId,
    };
    const validatedData = insertProjectSchema.parse(taskData);
    const [task] = await db
      .insert(projects)
      .values(validatedData)
      .returning();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating project task:", error);
    res.status(500).json({ message: "Failed to create project task" });
  }
}

export async function updateProjectTaskHandler(req: Request, res: Response) {
  try {
    const updates = req.body;
    const [task] = await db
      .update(projects)
      .set({ ...updates, lastUpdated: sql`CURRENT_TIMESTAMP` })
      .where(eq(projects.id, req.params.taskId))
      .returning();

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating project task:", error);
    res.status(500).json({ message: "Failed to update project task" });
  }
}
