import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getOnlineUsersHandler(req: Request, res: Response) {
  try {
    const onlineUsers = await storage.getOnlineUsers();
    const sanitizedUsers = onlineUsers.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Failed to fetch online users' });
  }
}
