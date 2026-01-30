import { Router } from "express";
import { requireAuth } from "../auth";
import {
  getObjectHandler,
  uploadHandler,
  createAttachmentHandler,
} from "../controllers/storageCtrl";

const router = Router();

// Get object
router.get("/:objectPath(*)", requireAuth, getObjectHandler);

export default router;

// Upload routes
export const uploadRouter = Router();
uploadRouter.post("/upload", requireAuth, uploadHandler);

// Attachments routes
export const attachmentsRouter = Router();
attachmentsRouter.post("/", requireAuth, createAttachmentHandler);
