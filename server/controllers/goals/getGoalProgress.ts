import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getGoalProgressHandler(req: Request, res: Response) {
  try {
    const progress = await storage.getGoalProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    res.status(500).json({ message: "Failed to fetch goal progress" });
  }
}
