import type { Request, Response } from "express";
import { storage } from "../../storage";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function createProjectHandler(req: Request, res: Response) {
  try {
    console.log("Creating project with data:", req.body);
    const validatedData = insertProjectSchema.parse(req.body);
    console.log("Validated data:", validatedData);
    const project = await storage.createProject(validatedData);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create project", error: String(error) });
    }
  }
}
