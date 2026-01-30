import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getActivityLogsHandler(req: Request, res: Response) {
  try {
    const { userId, action, limit = 50, offset = 0 } = req.query;
    const logs = await storage.getActivityLogs({
      userId: userId as string,
      action: action as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
}
