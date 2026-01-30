import type { Request, Response } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "../../objectStorage";

export async function getObjectHandler(req: Request, res: Response) {
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
}
