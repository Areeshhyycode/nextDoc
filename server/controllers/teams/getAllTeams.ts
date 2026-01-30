import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllTeamsHandler(req: Request, res: Response) {
  try {
    const teams = await storage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
}
