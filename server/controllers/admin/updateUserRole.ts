import type { Request, Response } from "express";
import { storage } from "../../storage";
import { updateUserRoleSchema } from "@shared/schema";
import { z } from "zod";

export async function updateUserRoleHandler(req: Request, res: Response) {
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
}
