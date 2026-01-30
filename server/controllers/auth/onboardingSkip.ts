import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function onboardingSkipHandler(req: Request, res: Response) {
  try {
    const user = req.user as any;

    const updatedUser = await storage.updateUser(user.id, {
      hasCompletedOnboarding: true
    });

    // Update the session with the new user data to ensure session is in sync
    // IMPORTANT: Wait for req.login to complete before sending response
    if (updatedUser) {
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Error updating session after skipping onboarding:', err);
          return res.status(500).json({ message: 'Failed to update session' });
        }
        res.json({ message: 'Onboarding skipped successfully', user: updatedUser });
      });
    } else {
      res.json({ message: 'Onboarding skipped successfully' });
    }
  } catch (error) {
    console.error('Error skipping onboarding:', error);
    res.status(500).json({ message: 'Failed to skip onboarding' });
  }
}
