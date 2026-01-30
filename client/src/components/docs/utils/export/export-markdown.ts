import { downloadFile, sanitizeFilename } from "./helpers";
import { htmlToMarkdown } from "./html-converters";

export function exportAsMarkdown(title: string, content: string): void {
  const safeTitle = sanitizeFilename(title);
  const markdown = htmlToMarkdown(content);
  const fullMarkdown = `# ${title}\n\n${markdown}`;

  downloadFile(fullMarkdown, `${safeTitle}.md`, "text/markdown;charset=utf-8");
}
