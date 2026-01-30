import type { Request, Response } from "express";
import { storage } from "../../storage";
import { hashPassword, validatePassword } from "../../auth";

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    const passwordValidation = await validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await storage.getUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUser(user.id, { password: hashedPassword });
    await storage.clearResetToken(user.id);

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
}
