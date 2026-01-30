import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function getAllUsersHandler(_req: Request, res: Response) {
  try {
    const users = await storage.getAllUsers();
    const publicUsers = users.map(({ id, displayName, email, profilePicture }) => ({
      id,
      displayName,
      email,
      profilePicture
    }));
    res.json(publicUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}
