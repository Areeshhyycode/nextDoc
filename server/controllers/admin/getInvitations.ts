import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getInvitationsHandler(req: Request, res: Response) {
  try {
    const invitations = await storage.getInvitations();
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Failed to fetch invitations' });
  }
}
