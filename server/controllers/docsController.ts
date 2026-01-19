import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

/**
 * Documents Controller
 * Handles all document-related API routes including CRUD operations and comments
 */

// Get all documents with optional filter
async function getAllDocsHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const { filter } = req.query;
    console.log("[GetDocs] Filter:", filter, "User:", userId);

    let docs;
    if (filter === 'my') {
      docs = await storage.getDocumentsByOwner(userId);
    } else if (filter === 'meeting_notes') {
      docs = await storage.getDocumentsByCategory('meeting_notes');
    } else {
      docs = await storage.getAllDocuments();
    }

    console.log("[GetDocs] Found:", docs.length, "documents");
    res.json(docs);
  } catch (error) {
    console.error("[GetDocs] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to fetch documents", error: errorMessage });
  }
}

async function getDocByIdHandler(req: Request, res: Response) {
  try {
    const doc = await storage.getDocument(req.params.id);
    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }
    res.json(doc);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: "Failed to fetch document" });
  }
}

async function createDocHandler(req: Request, res: Response) {
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

// Update document
async function updateDocHandler(req: Request, res: Response) {
  try {
    const {
      title,
      content,
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
    if (showCoverImage !== undefined) updates.showCoverImage = showCoverImage;
    if (showPageIconAndTitle !== undefined) updates.showPageIconAndTitle = showPageIconAndTitle;
    if (showAuthor !== undefined) updates.showAuthor = showAuthor;
    if (showContributors !== undefined) updates.showContributors = showContributors;
    if (showSubtitle !== undefined) updates.showSubtitle = showSubtitle;
    if (showLastModified !== undefined) updates.showLastModified = showLastModified;
    if (showPageOutline !== undefined) updates.showPageOutline = showPageOutline;

    const doc = await storage.updateDocument(req.params.id, updates);

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json(doc);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Failed to update document" });
  }
}

// Delete document
async function deleteDocHandler(req: Request, res: Response) {
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

// Get document comments
async function getCommentsHandler(req: Request, res: Response) {
  try {
    const comments = await storage.getDocumentComments(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
}

// Create comment
async function createCommentHandler(req: Request, res: Response) {
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

// Update comment
async function updateCommentHandler(req: Request, res: Response) {
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

// Delete comment
async function deleteCommentHandler(req: Request, res: Response) {
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

// Register all document routes
export function registerDocsRoutes(app: Express) {
  // Document CRUD routes
  app.get("/api/docs", requireAuth, getAllDocsHandler as any);
  app.get("/api/docs/:id", requireAuth, getDocByIdHandler as any);
  app.post("/api/docs", requireAuth, createDocHandler as any);
  app.put("/api/docs/:id", requireAuth, updateDocHandler as any);
  app.delete("/api/docs/:id", requireAuth, deleteDocHandler as any);

  // Document comments routes
  app.get("/api/docs/:id/comments", requireAuth, getCommentsHandler as any);
  app.post("/api/docs/:id/comments", requireAuth, createCommentHandler as any);
  app.put("/api/docs/:docId/comments/:commentId", requireAuth, updateCommentHandler as any);
  app.delete("/api/docs/:docId/comments/:commentId", requireAuth, deleteCommentHandler as any);
}
