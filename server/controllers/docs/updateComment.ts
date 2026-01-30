import type { Request, Response } from "express";
import { storage } from "../../storage";
import { z } from "zod";

const updateCommentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment too long (max 5000 characters)")
    .trim()
    .optional(),
  status: z.enum(['open', 'resolved']).optional()
}).refine(data => data.content !== undefined || data.status !== undefined, {
  message: "At least one field (content or status) must be provided"
});

/**
 * Update a comment
 * PUT /api/docs/:docId/comments/:commentId
 */
export async function updateCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    // Validate input
    const validation = updateCommentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Invalid input",
        errors: validation.error.flatten().fieldErrors
      });
      return;
    }

    const { content, status } = validation.data;
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
