import type { Request, Response } from "express";
import { storage } from "../../storage";
import { insertSprintSchema } from "@shared/schema";
import { z } from "zod";

export async function createSprintHandler(req: Request, res: Response) {
  try {
    const validatedData = insertSprintSchema.parse(req.body);
    const sprint = await storage.createSprint(validatedData);
    res.status(201).json(sprint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("Error creating sprint:", error);
      res.status(500).json({ message: "Failed to create sprint" });
    }
  }
}
