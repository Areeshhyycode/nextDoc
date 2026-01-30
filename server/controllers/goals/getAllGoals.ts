import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllGoalsHandler(_req: Request, res: Response) {
  try {
    const goals = await storage.getAllGoals();
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
}
