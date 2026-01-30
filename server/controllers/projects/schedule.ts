import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function scheduleProjectHandler(req: Request, res: Response) {
  try {
    const { scheduledDate } = req.body;
    const project = await storage.updateProject(req.params.id, { scheduledDate });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error scheduling project:", error);
    res.status(500).json({ message: "Failed to schedule project" });
  }
}
