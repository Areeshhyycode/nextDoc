import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getWorkspaceProjectHandler(req: Request, res: Response) {
  try {
    const project = await storage.getWorkspaceProject(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
}
