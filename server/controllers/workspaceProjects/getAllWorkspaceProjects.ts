import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllWorkspaceProjectsHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const projects = await storage.getWorkspaceProjectsForUser(userId);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching workspace projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}
