import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Update a comment
 * PUT /api/docs/:docId/comments/:commentId
 */
export async function updateCommentHandler(req: Request, res: Response) {
  try {
    const { content, status } = req.body;
    const comment = await storage.updateDocumentComment(req.params.commentId, {
      content,
      status
    });

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
}
