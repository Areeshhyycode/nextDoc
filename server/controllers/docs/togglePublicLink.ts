import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Toggle public link for a document
 * PATCH /api/docs/:id/public-link
 */
export async function togglePublicLinkHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const docId = req.params.id;
    const { enabled } = req.body;

    // Check if document exists and user is owner
    const doc = await storage.getDocument(docId);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.ownerId !== userId) {
      return res.status(403).json({ message: "Only the document owner can manage public link" });
    }

    // Generate token if enabling and no token exists
    let publicLinkToken = doc.publicLinkToken;
    if (enabled && !publicLinkToken) {
      // Generate a random token
      publicLinkToken = crypto.randomUUID().replace(/-/g, '');
    }

    const updatedDoc = await storage.updateDocument(docId, {
      publicLinkEnabled: enabled,
      publicLinkToken: enabled ? publicLinkToken : doc.publicLinkToken, // Keep token even when disabled
    }, false);

    res.json({
      publicLinkEnabled: updatedDoc?.publicLinkEnabled,
      publicLinkToken: updatedDoc?.publicLinkToken,
    });
  } catch (error) {
    console.error("Error toggling public link:", error);
    res.status(500).json({ message: "Failed to toggle public link" });
  }
}
