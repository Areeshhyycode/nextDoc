import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getUsersHandler(req: Request, res: Response) {
  try {
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}
