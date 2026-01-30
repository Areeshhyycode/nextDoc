import type { ExportFormat } from "./types";
import { exportAsHTML } from "./export-html";
import { exportAsMarkdown } from "./export-markdown";
import { exportAsPlainText } from "./export-text";
import { exportAsWord, exportAsDOCX, exportAsDOCM, exportAsDOT, exportAsDOTX, exportAsDOTM, exportAsStrict } from "./export-word";
import { exportAsPDF } from "./export-pdf";
import { exportAsJSON, exportAsRTF, exportAsXPS, exportAsMHT, exportAsODT, exportAsWordXML } from "./export-other";

/** Main export function - exports document in specified format */
export async function exportDocument(
  format: ExportFormat,
  title: string,
  content: string,
  metadata?: { author?: string; createdAt?: string; id?: string; tags?: string[] }
): Promise<void> {
  switch (format) {
    case "html":
      exportAsHTML(title, content, metadata);
      break;
    case "markdown":
      exportAsMarkdown(title, content);
      break;
    case "text":
      exportAsPlainText(title, content);
      break;
    case "pdf":
      await exportAsPDF(title, content, metadata);
      break;
    case "word":
      exportAsWord(title, content, metadata);
      break;
    case "docx":
      exportAsDOCX(title, content, metadata);
      break;
    case "dot":
      exportAsDOT(title, content, metadata);
      break;
    case "dotx":
      exportAsDOTX(title, content, metadata);
      break;
    case "json":
      exportAsJSON(title, content, metadata);
      break;
    case "rtf":
      exportAsRTF(title, content, metadata);
      break;
    case "xps":
      exportAsXPS(title, content, metadata);
      break;
    case "mht":
      exportAsMHT(title, content, metadata);
      break;
    case "odt":
      exportAsODT(title, content, metadata);
      break;
    case "wordxml":
      exportAsWordXML(title, content, metadata);
      break;
    case "docm":
      exportAsDOCM(title, content, metadata);
      break;
    case "dotm":
      exportAsDOTM(title, content, metadata);
      break;
    case "strict":
      exportAsStrict(title, content, metadata);
      break;
  }
}
