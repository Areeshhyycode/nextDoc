import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getLoginStatsHandler(req: Request, res: Response) {
  try {
    const stats = await storage.getUserLoginStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({ message: 'Failed to fetch login statistics' });
  }
}
