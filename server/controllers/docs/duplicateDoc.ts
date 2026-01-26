import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Duplicate a document
 * POST /api/docs/:id/duplicate
 */
export async function duplicateDocHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const originalDoc = await storage.getDocument(req.params.id);

    if (!originalDoc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Generate unique title for duplicate
    const baseTitle = `${originalDoc.title} (Copy)`;
    const uniqueTitle = await storage.generateUniqueDocumentName(baseTitle);

    // Create duplicate document
    const duplicateDoc = await storage.createDocument({
      title: uniqueTitle,
      content: originalDoc.content || "",
      ownerId: userId,
      category: originalDoc.category || 'blank',
      tags: originalDoc.tags || [],
      fontStyle: originalDoc.fontStyle || 'system',
      fontSize: originalDoc.fontSize || 'default',
      pageWidth: originalDoc.pageWidth || 'default',
      showCoverImage: originalDoc.showCoverImage ?? false,
      showPageIconAndTitle: originalDoc.showPageIconAndTitle ?? true,
      showAuthor: originalDoc.showAuthor ?? false,
      showContributors: originalDoc.showContributors ?? false,
      showSubtitle: originalDoc.showSubtitle ?? false,
      showLastModified: originalDoc.showLastModified ?? true,
      showPageOutline: originalDoc.showPageOutline ?? false,
    });

    console.log("[DuplicateDoc] Document duplicated:", duplicateDoc.id);
    res.status(201).json(duplicateDoc);
  } catch (error) {
    console.error("[DuplicateDoc] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to duplicate document", error: errorMessage });
  }
}
