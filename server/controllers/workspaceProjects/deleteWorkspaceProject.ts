import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function deleteWorkspaceProjectHandler(req: Request, res: Response) {
  try {
    const success = await storage.deleteWorkspaceProject(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
}
