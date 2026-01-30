import type { Request, Response } from "express";
import { storage } from "../../storage";
import { validateEmail } from "../../auth";

export async function onboardingCompleteHandler(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const { useCase, managementArea, heardFrom, workspaceName, features, inviteEmails } = req.body;

    const updatedUser = await storage.updateUser(user.id, {
      hasCompletedOnboarding: true,
      onboardingUseCase: useCase,
      onboardingManagementArea: managementArea,
      onboardingHeardFrom: heardFrom,
      onboardingWorkspaceName: workspaceName,
      onboardingInterestedFeatures: features || []
    });

    if (inviteEmails && Array.isArray(inviteEmails) && inviteEmails.length > 0) {
      for (const invite of inviteEmails) {
        if (invite.email && validateEmail(invite.email).isValid) {
          await storage.createInvitation({
            email: invite.email,
            role: invite.role || 'user',
            invitedBy: user.id
          });
        }
      }
    }

    // Update the session with the new user data to ensure session is in sync
    // IMPORTANT: Wait for req.login to complete before sending response
    if (updatedUser) {
      req.login(updatedUser, (err) => {
        if (err) {
          console.error('Error updating session after onboarding:', err);
          return res.status(500).json({ message: 'Failed to update session' });
        }
        res.json({ message: 'Onboarding completed successfully', user: updatedUser });
      });
    } else {
      res.json({ message: 'Onboarding completed successfully' });
    }
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
}
