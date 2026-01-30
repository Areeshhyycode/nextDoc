import multer from "multer";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import * as XLSX from "xlsx";
// pdf-parse is dynamically imported to avoid loading test files at startup

// Multer file type
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Multer error interface
export interface MulterErrorType extends Error {
  code?: string;
}

// Allowed extensions — formats we can actively parse
export const ALLOWED_EXTENSIONS = [
  ".pdf", ".docx", ".xlsx",
  // Word ZIP-based variants (mammoth handles all of these)
  ".docm", ".dotx", ".dotm",
  // Plain text / HTML
  ".txt", ".htm", ".html", ".mht", ".mhtml",
  // Word XML
  ".xml", ".xmll",
];

// Formats we recognise but cannot parse — give a helpful conversion message
export const UNSUPPORTED_WITH_HINT: Record<string, string> = {
  ".doc":  "Old .doc format is not supported. Please convert to .docx in Word first.",
  ".dot":  "Old .dot format is not supported. Please convert to .docx in Word first.",
  ".rtf":  "RTF format is not supported. Please convert to .docx or .txt first.",
  ".odt":  "ODT format is not supported. Please convert to .docx first.",
  ".xps":  "XPS format is not supported. Please convert to PDF or .docx first.",
  ".xls":  "Old .xls format is not supported. Please convert to .xlsx first.",
};

// Sanitize HTML config - XSS protection
export const sanitizeConfig: sanitizeHtml.IOptions = {
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
export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

export class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileParseError";
  }
}

// Multer config - accepts any file for validation
export const uploadForValidation = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
});

// Multer config - PDF, DOCX, XLSX for import
export const uploadForImport = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
  fileFilter: (_req: Express.Request, file: MulterFile, cb: multer.FileFilterCallback) => {
    const fileExtension = "." + file.originalname.split(".").pop()?.toLowerCase();

    // Known but unsupported format — give helpful hint
    const hint = UNSUPPORTED_WITH_HINT[fileExtension];
    if (hint) {
      cb(new FileValidationError(hint));
      return;
    }

    if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new FileValidationError(`File type '${fileExtension}' is not supported. Supported: PDF, DOCX, XLSX, TXT, HTML, and Word variants.`));
    }
  },
});

// Get file extension helper
export function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase();
}

// Check if buffer starts with %PDF- signature (tolerates BOM / leading whitespace)
function hasPdfSignature(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 1024).toString("binary");
  return head.includes("%PDF-");
}

// Verify a ZIP buffer contains a specific internal entry path
async function zipContainsEntry(buffer: Buffer, entryPath: string): Promise<boolean> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    return entryPath in zip.files;
  } catch {
    return false;
  }
}

// Validate file content using magic bytes + structure checks
async function validateFileContent(
  buffer: Buffer,
  expectedType: "pdf" | "docx" | "xlsx" | "txt" | "html" | "xml"
): Promise<{ valid: boolean; reason?: string }> {
  // Text-based formats — extension check is sufficient, no magic bytes needed
  if (expectedType === "txt") {
    if (buffer.length === 0) return { valid: false, reason: "File is empty" };
    return { valid: true };
  }

  if (expectedType === "html") {
    if (buffer.length === 0) return { valid: false, reason: "File is empty" };
    return { valid: true };
  }

  if (expectedType === "xml") {
    if (buffer.length === 0) return { valid: false, reason: "File is empty" };
    // Quick check: should contain an XML-like tag
    const preview = buffer.subarray(0, 4096).toString("utf8");
    if (preview.includes("<") && preview.includes(">")) return { valid: true };
    return { valid: false, reason: "File does not appear to contain valid XML" };
  }

  // fileTypeFromBuffer crashes on Node 18 with 'deflate-raw' not supported.
  // Wrap in try-catch so we fall through to manual signature checks below.
  let detectedType: { ext: string; mime: string } | undefined;
  try {
    detectedType = await fileTypeFromBuffer(buffer);
  } catch {
    // file-type unavailable on this Node version — rely on manual checks
    detectedType = undefined;
  }

  // --- PDF ---
  if (expectedType === "pdf") {
    if (detectedType?.ext === "pdf" || hasPdfSignature(buffer)) {
      return { valid: true };
    }
    return { valid: false, reason: "File does not contain a valid PDF signature" };
  }

  // --- DOCX / DOCM / DOTX / DOTM — all ZIP with word/document.xml ---
  if (expectedType === "docx") {
    if (detectedType?.ext === "zip" || detectedType?.ext === "docx" || detectedType?.mime === "application/zip" || !detectedType) {
      const hasWordEntry = await zipContainsEntry(buffer, "word/document.xml");
      if (hasWordEntry) return { valid: true };
      return { valid: false, reason: "ZIP file does not contain word/document.xml — not a valid Word document" };
    }
    return { valid: false, reason: "File is not a ZIP-based Word format" };
  }

  // --- XLSX ---
  if (expectedType === "xlsx") {
    if (detectedType?.ext === "zip" || detectedType?.ext === "xlsx" || detectedType?.mime === "application/zip" || !detectedType) {
      const hasSheetEntry = await zipContainsEntry(buffer, "xl/workbook.xml");
      if (hasSheetEntry) return { valid: true };
      return { valid: false, reason: "ZIP file does not contain xl/workbook.xml — not a valid XLSX" };
    }
    return { valid: false, reason: "File is not a ZIP-based XLSX format" };
  }

  return { valid: false, reason: "Unknown expected type" };
}

// Map extension to expected type key
export function extensionToType(ext: string): "pdf" | "docx" | "xlsx" | "txt" | "html" | "xml" | null {
  const map: Record<string, "pdf" | "docx" | "xlsx" | "txt" | "html" | "xml"> = {
    ".pdf": "pdf",
    // Word ZIP-based (all parsed by mammoth)
    ".docx": "docx",
    ".docm": "docx",
    ".dotx": "docx",
    ".dotm": "docx",
    // Spreadsheet
    ".xlsx": "xlsx",
    // Plain text
    ".txt": "txt",
    // HTML variants
    ".htm": "html",
    ".html": "html",
    ".mht": "html",
    ".mhtml": "html",
    // Word XML
    ".xml": "xml",
    ".xmll": "xml",
  };
  return map[ext] ?? null;
}

// Full file validation helper
export async function validateFile(file: MulterFile): Promise<{
  isValid: boolean;
  fileType: string | null;
  fileName: string;
  fileSize: number;
  error: string | null;
}> {
  const fileName = file.originalname;
  const fileSize = file.size;
  const fileExtension = getFileExtension(fileName);

  // Check for known-but-unsupported formats first
  const hint = UNSUPPORTED_WITH_HINT[fileExtension];
  if (hint) {
    return { isValid: false, fileType: fileExtension.replace(".", ""), fileName, fileSize, error: hint };
  }

  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      fileType: fileExtension.replace(".", ""),
      fileName,
      fileSize,
      error: `File type '${fileExtension}' is not supported. Supported: PDF, DOCX, XLSX, TXT, HTML, and Word variants.`
    };
  }

  const expectedType = extensionToType(fileExtension);
  if (!expectedType) {
    return { isValid: false, fileType: null, fileName, fileSize, error: "Unrecognized file type" };
  }

  // Deep content validation
  const contentCheck = await validateFileContent(file.buffer, expectedType);
  if (!contentCheck.valid) {
    return {
      isValid: false,
      fileType: expectedType,
      fileName,
      fileSize,
      error: contentCheck.reason ?? `File content does not match ${fileExtension.toUpperCase()} format`
    };
  }

  return { isValid: true, fileType: expectedType, fileName, fileSize, error: null };
}

// PDF parse helper — preserves whitespace layout so CVs/resumes render correctly
export async function parsePDF(buffer: Buffer): Promise<string> {
  // Use the internal lib path to avoid pdf-parse's index.js reading a test file
  // at ./test/data/05-versions-space.pdf relative to cwd (known upstream bug)
  // @ts-ignore — no types for the internal path, but it works at runtime
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new FileParseError("PDF appears to be empty or contains only images");
  }

  // Strip all tags so only plain text remains
  const safeText = sanitizeHtml(data.text, { allowedTags: [], allowedAttributes: {} });

  // Convert each line into its own <p> so TipTap/ProseMirror renders them
  // as separate paragraphs. Empty lines stay as <p></p> — that's what
  // TipTap's own serializer outputs for blank paragraphs.
  const html = safeText
    .split("\n")
    .map((line) => {
      const trimmed = line.trimEnd();
      return `<p>${trimmed}</p>`;
    })
    .join("");

  return html;
}

// DOCX parse helper — enriched sanitize config preserves Word formatting
export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });

  if (!result.value || result.value.trim().length === 0) {
    throw new FileParseError("Word document appears to be empty");
  }

  if (result.messages && result.messages.length > 0) {
    console.log("[DocImport] DOCX conversion warnings:", result.messages);
  }

  // Enriched config: allow div, img, blockquote, hr, pre, code that mammoth/Word produce
  const docxSanitizeConfig: sanitizeHtml.IOptions = {
    ...sanitizeConfig,
    allowedTags: [
      ...(sanitizeConfig.allowedTags as string[]),
      "div", "img", "blockquote", "hr", "pre", "code", "sub", "sup", "mark",
    ],
    allowedAttributes: {
      ...(sanitizeConfig.allowedAttributes as Record<string, string[]>),
      img: ["src", "alt", "width", "height"],
      div: ["style"],
      p: ["style"],
      span: ["style"],
      blockquote: ["style"],
    },
  };

  return sanitizeHtml(result.value, docxSanitizeConfig);
}

// XLSX parse helper — converts first sheet to HTML table
export async function parseXlsx(buffer: Buffer): Promise<string> {
  const wb = XLSX.read(buffer, { type: "buffer" });

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new FileParseError("XLSX file contains no sheets");
  }

  const sheet = wb.Sheets[wb.SheetNames[0]];
  const html = XLSX.utils.sheet_to_html(sheet);

  if (!html || html.trim().length === 0) {
    throw new FileParseError("XLSX first sheet appears to be empty");
  }

  return sanitizeHtml(html, sanitizeConfig);
}

// TXT parse helper — each line becomes a <p>
export function parseTxt(buffer: Buffer): string {
  const text = buffer.toString("utf8");

  if (text.trim().length === 0) {
    throw new FileParseError("Text file appears to be empty");
  }

  // Sanitize to strip any injected tags, then wrap each line in <p>
  const safeText = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
  return safeText
    .split("\n")
    .map((line) => `<p>${line.trimEnd()}</p>`)
    .join("");
}

// HTML parse helper — sanitize and return
export function parseHtml(buffer: Buffer): string {
  const html = buffer.toString("utf8");

  if (html.trim().length === 0) {
    throw new FileParseError("HTML file appears to be empty");
  }

  // Strip <script>, <style>, <iframe> etc. and only allow safe tags
  const htmlSanitizeConfig: sanitizeHtml.IOptions = {
    ...sanitizeConfig,
    allowedTags: [
      ...(sanitizeConfig.allowedTags as string[]),
      "div", "img", "blockquote", "hr", "pre", "code", "sub", "sup", "mark",
    ],
    allowedAttributes: {
      ...(sanitizeConfig.allowedAttributes as Record<string, string[]>),
      img: ["src", "alt", "width", "height"],
      div: ["style"],
      p: ["style"],
      span: ["style"],
    },
  };

  return sanitizeHtml(html, htmlSanitizeConfig);
}

// Word XML parse helper — mammoth handles .xml Word documents
export async function parseWordXml(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    if (result.value && result.value.trim().length > 0) {
      const docxSanitizeConfig: sanitizeHtml.IOptions = {
        ...sanitizeConfig,
        allowedTags: [
          ...(sanitizeConfig.allowedTags as string[]),
          "div", "img", "blockquote", "hr", "pre", "code", "sub", "sup", "mark",
        ],
        allowedAttributes: {
          ...(sanitizeConfig.allowedAttributes as Record<string, string[]>),
          img: ["src", "alt", "width", "height"],
          div: ["style"],
          p: ["style"],
          span: ["style"],
        },
      };
      return sanitizeHtml(result.value, docxSanitizeConfig);
    }
  } catch {
    // mammoth can't parse this XML — fall through to plain text extraction
  }

  // Fallback: strip XML tags and treat as plain text
  const text = buffer.toString("utf8");
  const stripped = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
  if (stripped.trim().length === 0) {
    throw new FileParseError("XML file appears to be empty or contains no readable text");
  }
  return stripped
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p>${line.trimEnd()}</p>`)
    .join("");
}

// Check if error is MulterError
export function isMulterError(error: unknown): error is MulterErrorType {
  return error instanceof Error && error.name === "MulterError";
}

// Error handling middleware for multer errors
export function handleMulterError(err: Error, _req: import("express").Request, res: import("express").Response, next: (err?: Error) => void) {
  if (err instanceof FileValidationError) {
    return res.status(400).json({ isValid: false, error: err.message });
  }
  if (isMulterError(err)) {
    if ((err as MulterErrorType).code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ isValid: false, error: "File size exceeds 10MB limit" });
    }
    return res.status(400).json({ isValid: false, error: err.message });
  }
  next(err);
}
