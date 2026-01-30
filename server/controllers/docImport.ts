import type { Express } from "express";
import { requireAuth } from "../auth";
import { uploadForValidation, uploadForImport, handleMulterError } from "./docs/docImportUtils";
import { validateFileHandler } from "./docs/validateFile";
import { importDocumentHandler } from "./docs/importDocument";

// Register routes
export function registerDocImportRoutes(app: Express) {
  // API 1: Validate file type
  app.post(
    "/api/docs/validate",
    requireAuth,
    uploadForValidation.single("file"),
    handleMulterError as any,
    validateFileHandler as any
  );

  // API 2: Import document
  app.post(
    "/api/docs/import",
    requireAuth,
    uploadForImport.single("file"),
    handleMulterError as any,
    importDocumentHandler as any
  );
}
