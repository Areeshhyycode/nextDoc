import type { Request, Response } from "express";
import { storage } from "../../storage";
import { insertGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function createGoalHandler(req: Request, res: Response) {
  try {
    const validatedData = insertGoalSchema.parse(req.body);
    const goal = await storage.createGoal(validatedData);
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  }
}
