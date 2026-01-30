import type { Request, Response } from "express";
import { storage } from "../../storage";
import { updateGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function updateGoalHandler(req: Request, res: Response) {
  try {
    const validatedData = updateGoalSchema.parse(req.body);
    const goal = await storage.updateGoal(req.params.id, validatedData);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  }
}
