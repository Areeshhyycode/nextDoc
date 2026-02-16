import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Toggle pinned status of a document
 * PATCH /api/docs/:id/pin
 */
export async function togglePinHandler(req: Request, res: Response) {
  try {
    const { isPinned } = req.body;

    const doc = await storage.updateDocument(req.params.id, { isPinned });

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json({ id: doc.id, isPinned: doc.isPinned });
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({ message: "Failed to toggle pin" });
  }
}
