import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function deleteGoalHandler(req: Request, res: Response) {
  try {
    const success = await storage.deleteGoal(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
}
