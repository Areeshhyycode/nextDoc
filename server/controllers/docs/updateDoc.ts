import type { Request, Response } from "express";
import { storage } from "../../storage";

/**
 * Update a document
 * PUT /api/docs/:id
 */
export async function updateDocHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const docId = req.params.id;

    // First, check if user has permission to edit this document
    const doc = await storage.getDocument(docId);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    // Check user's permission
    let canEdit = false;
    if (doc.ownerId === userId) {
      // Owner can always edit
      canEdit = true;
    } else {
      // Check if user has edit or edit_comment permission via sharing
      const share = await storage.getDocumentShareForUser(docId, userId);
      if (share && (share.permission === "edit" || share.permission === "edit_comment")) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      res.status(403).json({ message: "You don't have permission to edit this document" });
      return;
    }

    const {
      title,
      content,
      tags,
      fontStyle,
      fontSize,
      pageWidth,
      backgroundColor,
      textColor,
      headingColor,
      h1Color,
      h2Color,
      h3Color,
      h4Color,
      h5Color,
      h6Color,
      linkColor,
      codeBlockBg,
      codeBlockText,
      blockquoteBg,
      blockquoteText,
      tableBorderColor,
      tableHeaderBg,
      showPageOutline
    } = req.body;

    // If title is being updated, check for uniqueness (exclude current doc)
    if (title !== undefined) {
      const isUnique = await storage.isDocumentNameUnique(title, req.params.id);
      if (!isUnique) {
        const suggestedTitle = await storage.generateUniqueDocumentName(title);
        return res.status(409).json({
          message: "A document with this name already exists",
          suggestedTitle,
          code: "DUPLICATE_TITLE"
        });
      }
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    if (fontStyle !== undefined) updates.fontStyle = fontStyle;
    if (fontSize !== undefined) updates.fontSize = fontSize;
    if (pageWidth !== undefined) updates.pageWidth = pageWidth;
    if (backgroundColor !== undefined) updates.backgroundColor = backgroundColor;
    if (textColor !== undefined) updates.textColor = textColor;
    if (headingColor !== undefined) updates.headingColor = headingColor;
    if (h1Color !== undefined) updates.h1Color = h1Color;
    if (h2Color !== undefined) updates.h2Color = h2Color;
    if (h3Color !== undefined) updates.h3Color = h3Color;
    if (h4Color !== undefined) updates.h4Color = h4Color;
    if (h5Color !== undefined) updates.h5Color = h5Color;
    if (h6Color !== undefined) updates.h6Color = h6Color;
    if (linkColor !== undefined) updates.linkColor = linkColor;
    if (codeBlockBg !== undefined) updates.codeBlockBg = codeBlockBg;
    if (codeBlockText !== undefined) updates.codeBlockText = codeBlockText;
    if (blockquoteBg !== undefined) updates.blockquoteBg = blockquoteBg;
    if (blockquoteText !== undefined) updates.blockquoteText = blockquoteText;
    if (tableBorderColor !== undefined) updates.tableBorderColor = tableBorderColor;
    if (tableHeaderBg !== undefined) updates.tableHeaderBg = tableHeaderBg;
    if (showPageOutline !== undefined) updates.showPageOutline = showPageOutline;

    // Handle isFavorite
    const { isFavorite } = req.body;
    if (isFavorite !== undefined) updates.isFavorite = isFavorite;

    // Only update timestamp and lastUpdatedBy if title or content changed
    const shouldUpdateTimestamp = title !== undefined || content !== undefined;
    if (shouldUpdateTimestamp && userId) {
      updates.lastUpdatedBy = userId;
    }

    const updatedDoc = await storage.updateDocument(req.params.id, updates, shouldUpdateTimestamp);

    if (!updatedDoc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Failed to update document" });
  }
}
