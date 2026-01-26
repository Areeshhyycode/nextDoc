import { Router } from "express";
import { requireAuth } from "../auth";
import { ObjectStorageService, ObjectNotFoundError } from "../objectStorage";
import { projectAttachments } from "@shared/schema";
import { db } from "../db";

const router = Router();

// Get object
router.get("/:objectPath(*)", requireAuth, async (req, res) => {
  const userId = (req.user as any)?.id;
  const objectStorageService = new ObjectStorageService();
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);
    const canAccess = await objectStorageService.canAccessObjectEntity({
      objectFile,
      userId: userId,
    });
    if (!canAccess) {
      return res.sendStatus(401);
    }
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error("Error checking object access:", error);
    if (error instanceof ObjectNotFoundError) {
      return res.sendStatus(404);
    }
    return res.sendStatus(500);
  }
});

export default router;

// Upload routes
export const uploadRouter = Router();

uploadRouter.post("/upload", requireAuth, async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
});

// Attachments routes
export const attachmentsRouter = Router();

attachmentsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { projectId, fileName, fileUrl, fileSize } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      fileUrl,
      {
        owner: userId,
        visibility: "public",
      },
    );

    const [attachment] = await db
      .insert(projectAttachments)
      .values({ projectId, fileName, fileUrl: objectPath, fileSize, uploadedBy: userId })
      .returning();

    res.status(201).json(attachment);
  } catch (error) {
    console.error("Error creating attachment:", error);
    res.status(500).json({ message: "Failed to create attachment" });
  }
});
