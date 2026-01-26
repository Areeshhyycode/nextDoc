import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Update share permission for a user
 * PATCH /api/docs/:documentId/shares/:shareUserId
 */
export async function updateSharePermissionHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { documentId, shareUserId } = req.params;
    const { permission } = req.body;

    // Check if document exists and user owns it
    const doc = await storage.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.ownerId !== userId) {
      return res.status(403).json({ message: "Only the document owner can update sharing permissions" });
    }

    const updated = await storage.updateDocumentSharePermission(documentId, shareUserId, permission);
    if (!updated) {
      return res.status(404).json({ message: "Share not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating share permission:", error);
    res.status(500).json({ message: "Failed to update share permission" });
  }
}
