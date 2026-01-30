import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getSprintHandler(req: Request, res: Response) {
  try {
    const sprint = await storage.getSprint(req.params.id);
    if (!sprint) {
      res.status(404).json({ message: "Sprint not found" });
      return;
    }
    res.json(sprint);
  } catch (error) {
    console.error("Error fetching sprint:", error);
    res.status(500).json({ message: "Failed to fetch sprint" });
  }
}
