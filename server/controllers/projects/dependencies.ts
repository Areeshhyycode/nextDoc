import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getDependenciesHandler(req: Request, res: Response) {
  try {
    const dependencyInfo = await storage.getDependencyInfo(req.params.id);
    res.json(dependencyInfo);
  } catch (error) {
    console.error("Error fetching dependency info:", error);
    res.status(500).json({ message: "Failed to fetch dependency information" });
  }
}

export async function validateDependenciesHandler(req: Request, res: Response) {
  try {
    const { dependencies } = req.body;
    await storage.validateAndBlockIfNeeded(req.params.id, dependencies);
    res.json({ success: true });
  } catch (error) {
    console.error("Error validating dependencies:", error);
    res.status(500).json({ message: "Failed to validate dependencies" });
  }
}
