import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";


async function checkDocumentNameHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { title, excludeDocId } = req.query;

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        message: "Title is required",
        isUnique: false
      });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return res.status(400).json({
        message: "Title cannot be empty",
        isUnique: false
      });
    }

    const isUnique = await storage.isDocumentNameUnique(
      trimmedTitle,
      typeof excludeDocId === "string" ? excludeDocId : undefined
    );

    if (isUnique) {
      return res.status(200).json({
        isUnique: true,
        title: trimmedTitle,
        message: "Document name is available"
      });
    } else {
      const suggestedTitle = await storage.generateUniqueDocumentName(trimmedTitle);

      return res.status(200).json({
        isUnique: false,
        title: trimmedTitle,
        suggestedTitle,
        message: "A document with this name already exists"
      });
    }

  } catch (error: unknown) {
    console.error("[DocName] Check error:", error);
    res.status(500).json({
      message: "Failed to check document name",
      isUnique: false
    });
  }
}

async function generateUniqueNameHandler(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { title } = req.query;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Title is required" });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    // Generate unique name
    const uniqueTitle = await storage.generateUniqueDocumentName(trimmedTitle);

    return res.status(200).json({
      originalTitle: trimmedTitle,
      uniqueTitle,
      message: "Unique document name generated"
    });

  } catch (error: unknown) {
    console.error("[DocName] Generate error:", error);
    res.status(500).json({ message: "Failed to generate unique document name" });
  }
}

// Register routes
export function registerDocNameRoutes(app: Express) {
  // Check if document name is unique
  // GET /api/docs/check-name?title=My Document&excludeDocId=abc123
  app.get(
    "/api/docs/check-name",
    requireAuth,
    checkDocumentNameHandler as any
  );

  // Generate a unique document name
  // GET /api/docs/generate-name?title=My Document
  app.get(
    "/api/docs/generate-name",
    requireAuth,
    generateUniqueNameHandler as any
  );
}
