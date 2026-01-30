import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function createWorkspaceProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { name, color, startDate, endDate, privacy, memberIds, defaultLayout } = req.body;

    const project = await storage.createWorkspaceProject({
      name,
      color,
      startDate,
      endDate,
      ownerId: userId,
      privacy,
      memberIds,
      defaultLayout
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
}
