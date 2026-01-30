import type { Request, Response } from "express";
import { storage } from "../../storage";
import { isValidContextId } from "@shared/context-helpers";

export async function getViewPreferenceHandler(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const userId = (req.user as any).id;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    const preference = await storage.getViewPreference(userId, teamId);

    if (!preference) {
      return res.json({ viewType: 'table' });
    }

    res.json({ viewType: preference.viewType });
  } catch (error) {
    console.error('Error fetching view preference:', error);
    res.status(500).json({ message: 'Failed to fetch view preference' });
  }
}

export async function setViewPreferenceHandler(req: Request, res: Response) {
  try {
    const { teamId } = req.params;
    const { viewType } = req.body;
    const userId = (req.user as any).id;

    if (!isValidContextId(teamId)) {
      return res.status(400).json({ message: 'Invalid context ID format. Expected "dept:<name>" or "team:<uuid>"' });
    }

    if (!viewType || !['table', 'kanban'].includes(viewType)) {
      return res.status(400).json({ message: 'Invalid view type. Must be "table" or "kanban"' });
    }

    const preference = await storage.setViewPreference(userId, teamId, viewType);
    res.json(preference);
  } catch (error) {
    console.error('Error setting view preference:', error);
    res.status(500).json({ message: 'Failed to set view preference' });
  }
}
