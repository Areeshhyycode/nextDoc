import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { storage } from "../../storage";

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
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
}
