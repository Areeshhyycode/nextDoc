import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getGoalHandler(req: Request, res: Response) {
  try {
    const goal = await storage.getGoal(req.params.id);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Failed to fetch goal" });
  }
}
