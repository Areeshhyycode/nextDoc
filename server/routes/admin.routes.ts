import { Router, Request, Response, NextFunction } from "express";
import {
  getUsersHandler,
  getOnlineUsersHandler,
  getActivityLogsHandler,
  getLoginStatsHandler,
  updateUserRoleHandler,
  createInvitationsHandler,
  getInvitationsHandler,
} from "../controllers/admin";

const router = Router();

// Middleware: Require admin or sub-admin access
export const requireAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const user = req.user as any;
  if (user.role !== 'admin' && user.role !== 'sub-admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Users
router.get('/users', requireAdminAccess, getUsersHandler);
router.get('/users/online', requireAdminAccess, getOnlineUsersHandler);
router.put('/users/:id/role', requireAdminAccess, updateUserRoleHandler);

// Activity & Stats
router.get('/activity-logs', requireAdminAccess, getActivityLogsHandler);
router.get('/login-stats', requireAdminAccess, getLoginStatsHandler);

// Invitations
router.post('/invites', requireAdminAccess, createInvitationsHandler);
router.get('/invites', requireAdminAccess, getInvitationsHandler);

export default router;
