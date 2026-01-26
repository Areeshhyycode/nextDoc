import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Delete a document
 * DELETE /api/docs/:id
 */
export async function deleteDocHandler(req: Request, res: Response) {
  try {
    const success = await storage.deleteDocument(req.params.id);
    if (!success) {
      res.status(404).json({ message: "Document not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Failed to delete document" });
  }
}
