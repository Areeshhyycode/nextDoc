import type { Request, Response } from "express";
import { storage } from "../../storage";
import { hashPassword, validatePassword } from "../../auth";

export async function changePasswordHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const bcrypt = await import('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    const passwordValidation = await validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({ message: passwordValidation.message });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUser(userId, { password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
}
