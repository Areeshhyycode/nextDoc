import { Router } from "express";
import passport from "passport";
import { storage } from "../storage";
import { requireAuth, hashPassword, validatePassword, validateEmail } from "../auth";

const router = Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      displayName
    });

    req.login(user, (err) => {
      if (err) {
        console.error('Login error after signup:', err);
        return res.status(500).json({ message: 'Account created but login failed. Please try logging in.' });
      }
      res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  passport.authenticate('local', async (err: any, user: any, info: any) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Authentication system error. Please try again later.' });
    }
    if (!user) {
      const message = info?.message || 'Invalid email or password. Please check your credentials and try again.';
      return res.status(401).json({ message });
    }

    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.status(500).json({ message: 'Login session error. Please try again.' });
      }

      try {
        await storage.logActivity({
          userId: user.id,
          action: 'login',
          details: JSON.stringify({ email: user.email }),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        await storage.updateUserOnlineStatus(user.id, true);

        res.json({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            profilePicture: user.profilePicture
          }
        });
      } catch (logError) {
        console.error('Error logging activity:', logError);
        res.json({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            profilePicture: user.profilePicture
          }
        });
      }
    });
  })(req, res, next);
});

// Logout
router.post('/logout', async (req, res) => {
  const userId = (req.user as any)?.id;

  req.logout(async () => {
    if (userId) {
      try {
        await storage.logActivity({
          userId,
          action: 'logout',
          details: JSON.stringify({ timestamp: new Date().toISOString() }),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        await storage.updateUserOnlineStatus(userId, false);
      } catch (error) {
        console.error('Error logging logout:', error);
      }
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
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
});

// Reset Password
router.post('/reset-password', async (req, res) => {
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
});

// Get Current User
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Onboarding Complete
router.post('/onboarding/complete', requireAuth, async (req, res) => {
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
});

// Onboarding Skip
router.post('/onboarding/skip', requireAuth, async (req, res) => {
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
});

export default router;
