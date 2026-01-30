import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function deleteSprintHandler(req: Request, res: Response) {
  try {
    const success = await storage.deleteSprint(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sprint:", error);
    res.status(500).json({ message: "Failed to delete sprint" });
  }
}
