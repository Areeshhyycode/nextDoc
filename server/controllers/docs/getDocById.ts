import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Get a single document by ID
 * GET /api/docs/:id
 */
export async function getDocByIdHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const docId = req.params.id;
    console.log("[GetDocById] User:", userId, "DocId:", docId);

    const doc = await storage.getDocument(docId);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Determine user's permission for this document
    let userPermission: "owner" | "view" | "edit" | "comment" | "edit_comment" | null = null;

    if (doc.ownerId === userId) {
      // User is the owner - full access
      userPermission = "owner";
      console.log("[GetDocById] User is owner");
    } else {
      // Check if document is shared with this user
      const share = await storage.getDocumentShareForUser(docId, userId);
      console.log("[GetDocById] Share found:", share);
      if (share) {
        userPermission = share.permission;
      }
    }

    console.log("[GetDocById] Final userPermission:", userPermission);

    // If user has no permission, deny access
    if (!userPermission) {
      res.status(403).json({ message: "You don't have access to this document" });
      return;
    }

    // Fetch owner information
    const owner = await storage.getUser(doc.ownerId);
    const ownerInfo = owner ? {
      id: owner.id,
      displayName: owner.displayName,
      email: owner.email,
      profilePicture: owner.profilePicture,
    } : null;

    // Fetch last updater information (if document has been updated by someone)
    let lastUpdaterInfo = null;
    if (doc.lastUpdatedBy) {
      const lastUpdater = await storage.getUser(doc.lastUpdatedBy);
      if (lastUpdater) {
        lastUpdaterInfo = {
          id: lastUpdater.id,
          displayName: lastUpdater.displayName,
          email: lastUpdater.email,
          profilePicture: lastUpdater.profilePicture,
        };
      }
    }

    res.json({ ...doc, userPermission, owner: ownerInfo, lastUpdater: lastUpdaterInfo });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Failed to fetch document" });
  }
}
