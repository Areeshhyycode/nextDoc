import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Delete a comment
 * DELETE /api/docs/:docId/comments/:commentId
 */
export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const success = await storage.deleteDocumentComment(req.params.commentId);
    if (!success) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
}
