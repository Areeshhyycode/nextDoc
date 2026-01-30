import type { Request, Response } from "express";

export function getUserHandler(req: Request, res: Response) {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}
