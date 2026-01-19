import type { Express, Request, Response } from "express";
import multer from "multer";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import { fileTypeFromBuffer } from "file-type";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Multer error interface
interface MulterErrorType extends Error {
  code?: string;
}

// Valid MIME types (magic bytes check)
const VALID_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

// Allowed extensions
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

// Sanitize HTML config - XSS protection
const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "b", "i", "u", "strong", "em",
    "a", "ul", "ol", "li", "br", "span", "table",
    "thead", "tbody", "tr", "th", "td"
  ],
  allowedAttributes: {
    a: ["href"],
    span: ["style"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https"],
};

// Custom error classes
class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileParseError";
  }
}

// Multer config - accepts any file for validation
const uploadForValidation = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
});

// Multer config - sirf PDF aur DOCX for import
const uploadForImport = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
  fileFilter: (_req: Express.Request, file: MulterFile, cb: multer.FileFilterCallback) => {
    const fileExtension = "." + file.originalname.split(".").pop()?.toLowerCase();

    if (fileExtension === ".doc") {
      cb(new FileValidationError("Old .doc format not supported. Please convert to .docx"));
      return;
    }

    if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new FileValidationError("Only PDF and DOCX files are allowed"));
    }
  },
});

// Get file extension helper
function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase();
}

// Validate file content using magic bytes
async function validateFileContent(buffer: Buffer, expectedType: "pdf" | "docx"): Promise<boolean> {
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType) {
    return false;
  }

  if (expectedType === "docx") {
    return detectedType.mime === "application/zip" ||
           detectedType.mime === VALID_MIME_TYPES.docx;
  }

  return detectedType.mime === VALID_MIME_TYPES[expectedType];
}

// Full file validation helper
async function validateFile(file: MulterFile): Promise<{
  isValid: boolean;
  fileType: string | null;
  fileName: string;
  fileSize: number;
  error: string | null;
}> {
  const fileName = file.originalname;
  const fileSize = file.size;
  const fileExtension = getFileExtension(fileName);

  // Check extension
  if (fileExtension === ".doc") {
    return {
      isValid: false,
      fileType: "doc",
      fileName,
      fileSize,
      error: "Old .doc format not supported. Please convert to .docx"
    };
  }

  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      fileType: fileExtension.replace(".", ""),
      fileName,
      fileSize,
      error: `File type '${fileExtension}' not supported. Only PDF and DOCX allowed`
    };
  }

  // Check magic bytes
  const expectedType = fileExtension === ".pdf" ? "pdf" : "docx";
  const isValidContent = await validateFileContent(file.buffer, expectedType);

  if (!isValidContent) {
    return {
      isValid: false,
      fileType: fileExtension.replace(".", ""),
      fileName,
      fileSize,
      error: `File content does not match ${fileExtension.toUpperCase()} format. File may be corrupted or renamed`
    };
  }

  return {
    isValid: true,
    fileType: expectedType,
    fileName,
    fileSize,
    error: null
  };
}

// PDF parse helper
async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfData = await pdfParse(buffer);

  if (!pdfData.text || pdfData.text.trim().length === 0) {
    throw new FileParseError("PDF appears to be empty or contains only images");
  }

  const content = pdfData.text
    .split(/\n{2,}/)
    .filter((para: string) => para.trim().length > 0)
    .map((para: string) => {
      const trimmed = para.trim();
      if (trimmed.length < 100 && trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        return `<h2>${trimmed}</h2>`;
      }
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return sanitizeHtml(content, sanitizeConfig);
}

// DOCX parse helper
async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });

  if (!result.value || result.value.trim().length === 0) {
    throw new FileParseError("DOCX appears to be empty");
  }

  if (result.messages && result.messages.length > 0) {
    console.log("[DocImport] DOCX conversion warnings:", result.messages);
  }

  return sanitizeHtml(result.value, sanitizeConfig);
}

// Check if error is MulterError
function isMulterError(error: unknown): error is MulterErrorType {
  return error instanceof Error && error.name === "MulterError";
}

// ============================================
// API 1: VALIDATE FILE (check type before import)
// POST /api/docs/validate
// ============================================
async function validateFileHandler(req: Request & { file?: MulterFile }, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        isValid: false,
        error: "No file uploaded"
      });
    }

    const validation = await validateFile(req.file);

    if (!validation.isValid) {
      return res.status(400).json({
        isValid: false,
        fileName: validation.fileName,
        fileSize: validation.fileSize,
        fileType: validation.fileType,
        error: validation.error
      });
    }

    // File is valid
    return res.status(200).json({
      isValid: true,
      fileName: validation.fileName,
      fileSize: validation.fileSize,
      fileType: validation.fileType,
      message: "File is valid and ready to import"
    });

  } catch (error: unknown) {
    console.error("[DocValidate] Error:", error);

    if (isMulterError(error)) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          isValid: false,
          error: "File size exceeds 10MB limit"
        });
      }
      return res.status(400).json({
        isValid: false,
        error: error.message
      });
    }

    res.status(500).json({
      isValid: false,
      error: "Failed to validate file"
    });
  }
}

// ============================================
// API 2: IMPORT FILE (after validation)
// POST /api/docs/import
// ============================================
async function importDocumentHandler(req: Request & { file?: MulterFile }, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate file first
    const validation = await validateFile(file);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const fileExtension = getFileExtension(file.originalname);
    const extractedTitle = file.originalname.replace(/\.[^/.]+$/, "");
    let extractedContent = "";

    // Parse based on file type
    if (fileExtension === ".pdf") {
      extractedContent = await parsePDF(file.buffer);
    } else if (fileExtension === ".docx") {
      extractedContent = await parseDocx(file.buffer);
    }

    // Save to database
    const newDoc = await storage.createDocument({
      title: extractedTitle,
      content: extractedContent,
      ownerId: userId,
      category: "blank",
    });

    res.status(201).json(newDoc);

  } catch (error: unknown) {
    console.error("[DocImport] Error:", error);

    if (error instanceof FileValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof FileParseError) {
      return res.status(422).json({ message: error.message });
    }

    if (isMulterError(error)) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File size exceeds 10MB limit" });
      }
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to import document" });
  }
}

// Error handling middleware
function handleMulterError(err: Error, _req: Request, res: Response, next: (err?: Error) => void) {
  if (err instanceof FileValidationError) {
    return res.status(400).json({ isValid: false, error: err.message });
  }
  if (isMulterError(err)) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ isValid: false, error: "File size exceeds 10MB limit" });
    }
    return res.status(400).json({ isValid: false, error: err.message });
  }
  next(err);
}

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
