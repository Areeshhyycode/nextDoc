import type { Request, Response } from "express";
import { storage } from "../../storage";
import { updateSprintSchema } from "@shared/schema";
import { z } from "zod";

export async function updateSprintHandler(req: Request, res: Response) {
  try {
    const validatedData = updateSprintSchema.parse(req.body);
    const sprint = await storage.updateSprint(req.params.id, validatedData);
    if (!sprint) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.json(sprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error updating sprint:", error);
      res.status(500).json({ message: "Failed to update sprint" });
    }
  }
}
