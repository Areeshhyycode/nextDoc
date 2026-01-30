import type { Request, Response } from "express";
import { storage } from "../../storage";

export async function createInvitationsHandler(req: Request, res: Response) {
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
}
