import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getSprintProgressHandler(req: Request, res: Response) {
  try {
    const progress = await storage.getSprintProgress(req.params.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching sprint progress:", error);
    res.status(500).json({ message: "Failed to fetch sprint progress" });
  }
}
