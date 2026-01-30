import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function updateProfileHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const updates = req.body;
    const updatedUser = await storage.updateUser(userId, updates);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
}
