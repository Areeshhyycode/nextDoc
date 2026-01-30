import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getProjectHandler(req: Request, res: Response) {
  try {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
}
