import type { Request, Response } from "express";
import { ObjectStorageService } from "../../objectStorage";

export async function uploadHandler(req: Request, res: Response) {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
}
