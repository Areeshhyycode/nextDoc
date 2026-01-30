import { downloadFile, sanitizeFilename } from "./helpers";
import { htmlToPlainText } from "./html-converters";

export function exportAsPlainText(title: string, content: string): void {
  const safeTitle = sanitizeFilename(title);
  const plainText = htmlToPlainText(content);
  const fullText = `${title}\n${"=".repeat(title.length)}\n\n${plainText}`;

  downloadFile(fullText, `${safeTitle}.txt`, "text/plain;charset=utf-8");
}
