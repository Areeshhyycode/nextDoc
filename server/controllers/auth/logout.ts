import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function logoutHandler(req: Request, res: Response) {
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
}
