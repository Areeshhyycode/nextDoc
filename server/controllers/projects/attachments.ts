import type { Request, Response } from "express";
import { projectAttachments } from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";

export async function getProjectAttachmentsHandler(req: Request, res: Response) {
  try {
    const attachments = await db
      .select()
      .from(projectAttachments)
      .where(eq(projectAttachments.projectId, req.params.projectId))
      .orderBy(desc(projectAttachments.createdAt));
    res.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ message: "Failed to fetch attachments" });
  }
}

export async function deleteProjectAttachmentHandler(req: Request, res: Response) {
  try {
    await db
      .delete(projectAttachments)
      .where(eq(projectAttachments.id, req.params.id));

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
}
