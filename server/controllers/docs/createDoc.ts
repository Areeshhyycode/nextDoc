import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Create a new document
 * POST /api/docs
 */
export async function createDocHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    console.log("[CreateDoc] User ID:", userId);
    console.log("[CreateDoc] Request body:", req.body);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const {
      title,
      content,
      category,
      tags,
      fontStyle,
      fontSize,
      pageWidth,
      showCoverImage,
      showPageIconAndTitle,
      showAuthor,
      showContributors,
      showSubtitle,
      showLastModified,
      showPageOutline
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check if document name is unique
    const isUnique = await storage.isDocumentNameUnique(title);
    if (!isUnique) {
      // Generate a unique name suggestion
      const suggestedTitle = await storage.generateUniqueDocumentName(title);
      return res.status(409).json({
        message: "A document with this name already exists",
        suggestedTitle,
        code: "DUPLICATE_TITLE"
      });
    }

    const doc = await storage.createDocument({
      title,
      content: content || "",
      ownerId: userId,
      category: category || 'blank',
      tags: tags || [],
      fontStyle: fontStyle || 'system',
      fontSize: fontSize || 'default',
      pageWidth: pageWidth || 'default',
      showCoverImage: showCoverImage ?? false,
      showPageIconAndTitle: showPageIconAndTitle ?? true,
      showAuthor: showAuthor ?? false,
      showContributors: showContributors ?? false,
      showSubtitle: showSubtitle ?? false,
      showLastModified: showLastModified ?? true,
      showPageOutline: showPageOutline ?? false,
    });

    console.log("[CreateDoc] Document created:", doc.id);
    res.status(201).json(doc);
  } catch (error) {
    console.error("[CreateDoc] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to create document", error: errorMessage });
  }
}
