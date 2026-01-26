import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { validateEmail } from "../auth";
import { updateUserRoleSchema } from "@shared/schema";
import { z } from "zod";

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

// Get all users
router.get('/users', requireAdminAccess, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const sanitizedUsers = users.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get online users
router.get('/users/online', requireAdminAccess, async (req, res) => {
  try {
    const onlineUsers = await storage.getOnlineUsers();
    const sanitizedUsers = onlineUsers.map(({ password, resetToken, resetTokenExpiry, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Failed to fetch online users' });
  }
});

// Get activity logs
router.get('/activity-logs', requireAdminAccess, async (req, res) => {
  try {
    const { userId, action, limit = 50, offset = 0 } = req.query;
    const logs = await storage.getActivityLogs({
      userId: userId as string,
      action: action as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

// Get login stats
router.get('/login-stats', requireAdminAccess, async (req, res) => {
  try {
    const stats = await storage.getUserLoginStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({ message: 'Failed to fetch login statistics' });
  }
});

// Update user role
router.put('/users/:id/role', requireAdminAccess, async (req, res) => {
  try {
    const currentUser = req.user as any;
    const targetUserId = req.params.id;

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    const validatedData = updateUserRoleSchema.parse(req.body);
    const updatedUser = await storage.updateUserRole(targetUserId, validatedData.role);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await storage.logActivity({
      userId: currentUser.id,
      action: 'role_change',
      details: JSON.stringify({
        targetUserId,
        oldRole: 'unknown',
        newRole: validatedData.role
      }),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    const { password, resetToken, resetTokenExpiry, ...sanitizedUser } = updatedUser;
    res.json(sanitizedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid role data', errors: error.errors });
    } else {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  }
});

// Create invitations
router.post('/invites', requireAdminAccess, async (req, res) => {
  try {
    const currentUser = req.user as any;
    const { emails, role } = req.body;

    if (!emails || typeof emails !== 'string') {
      return res.status(400).json({ message: 'Email addresses are required' });
    }

    const emailList = emails
      .split(/[,\s]+/)
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    if (emailList.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one valid email address' });
    }

    const createdInvitations = [];
    for (const email of emailList) {
      const invitation = await storage.createInvitation({
        email,
        role: role || 'user',
        invitedBy: currentUser.id,
        status: 'pending'
      });
      createdInvitations.push(invitation);
    }

    await storage.logActivity({
      userId: currentUser.id,
      action: 'invitations_sent',
      details: JSON.stringify({
        emails: emailList,
        role: role || 'user',
        count: emailList.length
      }),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: `${createdInvitations.length} invitation(s) sent successfully`,
      invitations: createdInvitations
    });
  } catch (error) {
    console.error('Error creating invitations:', error);
    res.status(500).json({ message: 'Failed to send invitations' });
  }
});

// Get invitations
router.get('/invites', requireAdminAccess, async (req, res) => {
  try {
    const invitations = await storage.getInvitations();
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Failed to fetch invitations' });
  }
});

export default router;
