import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Remove document share for a user
 * DELETE /api/docs/:documentId/shares/:shareUserId
 */
export async function removeDocumentShareHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { documentId, shareUserId } = req.params;

    // Check if document exists and user owns it
    const doc = await storage.getDocument(documentId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.ownerId !== userId) {
      return res.status(403).json({ message: "Only the document owner can remove shares" });
    }

    const success = await storage.removeDocumentShare(documentId, shareUserId);
    if (!success) {
      return res.status(404).json({ message: "Share not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error removing document share:", error);
    res.status(500).json({ message: "Failed to remove document share" });
  }
}
