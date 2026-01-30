/**
 * Document Export Utilities
 * Handles exporting documents to various formats: HTML, Markdown, Plain Text, PDF, Word, RTF, etc.
 *
 * This is a barrel file — all implementation lives in ./export/ sub-modules.
 */

// Types & constants
export { type ExportFormat, EXPORT_FORMATS } from "./export/types";

// Main dispatcher
export { exportDocument } from "./export/export-document";

// Individual format exporters
export { exportAsHTML } from "./export/export-html";
export { exportAsMarkdown } from "./export/export-markdown";
export { exportAsPlainText } from "./export/export-text";
export { exportAsWord, exportAsDOCX, exportAsDOCM, exportAsDOT, exportAsDOTX, exportAsDOTM, exportAsStrict } from "./export/export-word";
export { exportAsPDF } from "./export/export-pdf";
export { exportAsJSON, exportAsRTF, exportAsXPS, exportAsMHT, exportAsODT, exportAsWordXML } from "./export/export-other";
