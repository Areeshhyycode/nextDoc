import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Create a new comment on a document
 * POST /api/docs/:id/comments
 */
export async function createCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { content, mentionedUserIds } = req.body;

    const comment = await storage.createDocumentComment({
      documentId: req.params.id,
      userId,
      content,
      status: 'open',
      mentionedUserIds: mentionedUserIds || []
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
}
