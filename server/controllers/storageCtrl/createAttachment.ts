import type { Request, Response } from "express";
import { ObjectStorageService } from "../../objectStorage";
import { projectAttachments } from "@shared/schema";
import { db } from "../../db";

export async function createAttachmentHandler(req: Request, res: Response) {
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
}
