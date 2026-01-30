import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllSprintsHandler(_req: Request, res: Response) {
  try {
    const sprints = await storage.getAllSprints();
    res.json(sprints);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Failed to fetch sprints" });
  }
}
