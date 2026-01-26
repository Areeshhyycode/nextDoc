import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Share document with a user
 * POST /api/docs/:documentId/shares
 */
export async function shareDocumentHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { documentId } = req.params;
    const { userEmail, permission } = req.body;

    if (!userEmail || !permission) {
      return res.status(400).json({ message: "User email and permission are required" });
    }

    // Find user by email
    const targetUser = await storage.getUserByEmail(userEmail);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Can't share with yourself
    if (targetUser.id === userId) {
      return res.status(400).json({ message: "Cannot share document with yourself" });
    }

    // Check if document exists and user owns it
    const doc = await storage.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.ownerId !== userId) {
      return res.status(403).json({ message: "Only the document owner can share it" });
    }

    const share = await storage.shareDocument({
      documentId,
      userId: targetUser.id,
      permission,
      sharedBy: userId
    });

    res.status(201).json({
      ...share,
      user: {
        id: targetUser.id,
        displayName: targetUser.displayName,
        email: targetUser.email,
        profilePicture: targetUser.profilePicture
      }
    });
  } catch (error) {
    console.error("Error sharing document:", error);
    res.status(500).json({ message: "Failed to share document" });
  }
}
