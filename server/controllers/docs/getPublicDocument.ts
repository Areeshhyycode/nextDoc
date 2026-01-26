import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Get document by public token (no auth required)
 * GET /api/public/docs/:token
 */
export async function getPublicDocumentHandler(req: Request, res: Response) {
  try {
    const { token } = req.params;
    console.log("[PublicDoc] Fetching document with token:", token);

    const doc = await storage.getDocumentByPublicToken(token);
    if (!doc) {
      console.log("[PublicDoc] Document not found for token:", token);
      return res.status(404).json({ message: "Document not found" });
    }

    if (!doc.publicLinkEnabled) {
      console.log("[PublicDoc] Public link is disabled for document:", doc.id);
      return res.status(403).json({ message: "Public link is disabled for this document" });
    }

    // Get owner info for display
    const owner = await storage.getUser(doc.ownerId);
    const ownerName = owner?.displayName || "Unknown";

    console.log("[PublicDoc] Returning document:", doc.id, "title:", doc.title);

    // Return document with page styles and owner name
    res.json({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      pageStyles: {
        fontStyle: doc.fontStyle || "system",
        fontSize: doc.fontSize || "default",
        pageWidth: doc.pageWidth || "default",
        showLastModified: doc.showLastModified ?? true,
      },
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
      ownerName,
    });
  } catch (error) {
    console.error("Error fetching public document:", error);
    res.status(500).json({ message: "Failed to fetch document" });
  }
}
