import type { Request, Response } from "express";
import { storage } from "../../storage";
import { updateProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function updateProjectHandler(req: Request, res: Response) {
  try {
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await storage.updateProject(req.params.id, validatedData);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update project" });
    }
  }
}
