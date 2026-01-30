import type { Request, Response } from "express";
import { storage } from "../../storage";
import { validateEmail } from "../../auth";

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000);

    await storage.updateUserResetToken(user.id, resetToken, resetExpiry);

    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request.' });
  }
}
