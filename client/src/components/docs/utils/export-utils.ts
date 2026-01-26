/**
 * Document Export Utilities
 * Handles exporting documents to various formats: HTML, Markdown, Plain Text, PDF
 */

// Helper function to trigger file download
function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Sanitize filename by removing invalid characters
function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim() || "Untitled";
}

/**
 * Export document as HTML file
 */
export function exportAsHTML(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; margin-top: 1.5em; }
    h3 { font-size: 1.25em; margin-top: 1.25em; }
    p { margin: 1em 0; }
    ul, ol { padding-left: 2em; }
    li { margin: 0.25em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    blockquote { border-left: 3px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    a { color: #0066cc; }
    .task-list { list-style: none; padding-left: 0; }
    .task-list li { display: flex; align-items: center; gap: 8px; }
    .task-list input[type="checkbox"] { margin: 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color: #666; font-size: 0.9em;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color: #666; font-size: 0.9em;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
  ${content}
</body>
</html>`;

  downloadFile(htmlDocument, `${safeTitle}.html`, "text/html;charset=utf-8");
}

/**
 * Export document as Markdown file
 * Converts HTML content to Markdown format
 */
export function exportAsMarkdown(title: string, content: string): void {
  const safeTitle = sanitizeFilename(title);

  // Convert HTML to Markdown
  const markdown = htmlToMarkdown(content);
  const fullMarkdown = `# ${title}\n\n${markdown}`;

  downloadFile(fullMarkdown, `${safeTitle}.md`, "text/markdown;charset=utf-8");
}

/**
 * Export document as plain text file
 * Strips all HTML formatting
 */
export function exportAsPlainText(title: string, content: string): void {
  const safeTitle = sanitizeFilename(title);

  // Strip HTML tags and convert to plain text
  const plainText = htmlToPlainText(content);
  const fullText = `${title}\n${"=".repeat(title.length)}\n\n${plainText}`;

  downloadFile(fullText, `${safeTitle}.txt`, "text/plain;charset=utf-8");
}

/**
 * Export document as Word (DOCX) file
 * Creates a simple DOCX-compatible document using HTML in a Word-readable format
 */
export function exportAsWord(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // Word can open HTML files with .doc extension
  // We use the mso-application directive to make it open properly in Word
  const wordDocument = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if gte mso 9]>
  <xml>
    <o:DocumentProperties>
      <o:Title>${escapeHtml(title)}</o:Title>
      ${metadata?.author ? `<o:Author>${escapeHtml(metadata.author)}</o:Author>` : ""}
    </o:DocumentProperties>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: A4; margin: 1in; }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
    }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #1a1a1a; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; color: #2a2a2a; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; color: #3a3a3a; }
    h4 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
    p { margin: 0 0 10pt 0; }
    ul, ol { margin: 0 0 10pt 0; padding-left: 20pt; }
    li { margin: 2pt 0; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    blockquote { border-left: 3pt solid #ccc; margin: 10pt 0; padding-left: 10pt; color: #555; font-style: italic; }
    code { font-family: 'Consolas', 'Courier New', monospace; background-color: #f5f5f5; padding: 1pt 3pt; font-size: 10pt; }
    pre { font-family: 'Consolas', 'Courier New', monospace; background-color: #f5f5f5; padding: 10pt; font-size: 10pt; white-space: pre-wrap; }
    a { color: #0066cc; text-decoration: underline; }
    .metadata { color: #666; font-size: 10pt; margin-bottom: 15pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author || metadata?.createdAt ? `
  <p class="metadata">
    ${metadata?.author ? `Author: ${escapeHtml(metadata.author)}` : ""}
    ${metadata?.author && metadata?.createdAt ? " | " : ""}
    ${metadata?.createdAt ? `Created: ${new Date(metadata.createdAt).toLocaleDateString()}` : ""}
  </p>` : ""}
  ${content}
</body>
</html>`;

  // Use .doc extension for better Word compatibility
  downloadFile(wordDocument, `${safeTitle}.doc`, "application/msword");
}

/**
 * Export document as JSON file
 * Preserves the raw document structure for backup/import purposes
 */
export function exportAsJSON(
  title: string,
  content: string,
  metadata?: { author?: string; createdAt?: string; id?: string; tags?: string[] }
): void {
  const safeTitle = sanitizeFilename(title);

  const jsonDocument = {
    title,
    content,
    exportedAt: new Date().toISOString(),
    metadata: {
      author: metadata?.author || null,
      createdAt: metadata?.createdAt || null,
      id: metadata?.id || null,
      tags: metadata?.tags || [],
    },
    format: "nexustrack-document",
    version: "1.0",
  };

  downloadFile(
    JSON.stringify(jsonDocument, null, 2),
    `${safeTitle}.json`,
    "application/json;charset=utf-8"
  );
}

/**
 * Export document as RTF (Rich Text Format) file
 * Compatible with most word processors
 */
export function exportAsRTF(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // Convert HTML to RTF
  const rtfContent = htmlToRTF(title, content, metadata);

  downloadFile(rtfContent, `${safeTitle}.rtf`, "application/rtf");
}

/**
 * Export document as PDF file
 * Uses browser's print functionality for reliable PDF generation
 */
export function exportAsPDF(title: string, content: string, metadata?: { author?: string }): void {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to export as PDF");
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @media print {
      @page { margin: 1in; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 100%;
      padding: 0;
      line-height: 1.6;
      color: #000;
      font-size: 12pt;
    }
    h1 { font-size: 24pt; margin-bottom: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
    h2 { font-size: 18pt; margin-top: 1.5em; }
    h3 { font-size: 14pt; margin-top: 1.25em; }
    p { margin: 0.75em 0; }
    ul, ol { padding-left: 1.5em; }
    li { margin: 0.25em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #333; padding: 6px; text-align: left; }
    th { background-color: #f0f0f0; }
    blockquote { border-left: 3px solid #666; margin: 1em 0; padding-left: 1em; color: #444; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 2px; font-family: monospace; font-size: 10pt; }
    pre { background: #f0f0f0; padding: 0.75em; border-radius: 3px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    a { color: #000; text-decoration: underline; }
    .no-print { display: none; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color: #666; font-size: 10pt; margin-bottom: 1em;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 250);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Helper: Escape HTML special characters
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Helper: Convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  // Create a temporary element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  return processNode(temp);
}

function processNode(node: Node): string {
  let result = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || "";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const innerContent = processNode(element);

      switch (tagName) {
        case "h1":
          result += `\n# ${innerContent.trim()}\n\n`;
          break;
        case "h2":
          result += `\n## ${innerContent.trim()}\n\n`;
          break;
        case "h3":
          result += `\n### ${innerContent.trim()}\n\n`;
          break;
        case "h4":
          result += `\n#### ${innerContent.trim()}\n\n`;
          break;
        case "p":
          result += `${innerContent.trim()}\n\n`;
          break;
        case "strong":
        case "b":
          result += `**${innerContent}**`;
          break;
        case "em":
        case "i":
          result += `*${innerContent}*`;
          break;
        case "u":
          result += `<u>${innerContent}</u>`;
          break;
        case "s":
        case "strike":
          result += `~~${innerContent}~~`;
          break;
        case "code":
          if (element.parentElement?.tagName.toLowerCase() === "pre") {
            result += innerContent;
          } else {
            result += `\`${innerContent}\``;
          }
          break;
        case "pre":
          result += `\n\`\`\`\n${innerContent.trim()}\n\`\`\`\n\n`;
          break;
        case "blockquote":
          const lines = innerContent.trim().split("\n");
          result += lines.map((line) => `> ${line}`).join("\n") + "\n\n";
          break;
        case "ul":
          result += `\n${innerContent}`;
          break;
        case "ol":
          result += `\n${processOrderedList(element)}`;
          break;
        case "li":
          const isTaskItem = element.hasAttribute("data-type") && element.getAttribute("data-type") === "taskItem";
          const isChecked = element.getAttribute("data-checked") === "true";
          if (isTaskItem) {
            result += `- [${isChecked ? "x" : " "}] ${innerContent.trim()}\n`;
          } else if (element.parentElement?.tagName.toLowerCase() === "ol") {
            // Handled by processOrderedList
            result += innerContent;
          } else {
            result += `- ${innerContent.trim()}\n`;
          }
          break;
        case "a":
          const href = element.getAttribute("href") || "";
          result += `[${innerContent}](${href})`;
          break;
        case "img":
          const src = element.getAttribute("src") || "";
          const alt = element.getAttribute("alt") || "";
          result += `![${alt}](${src})`;
          break;
        case "br":
          result += "\n";
          break;
        case "hr":
          result += "\n---\n\n";
          break;
        case "table":
          result += `\n${processTable(element)}\n`;
          break;
        default:
          result += innerContent;
      }
    }
  });

  return result;
}

function processOrderedList(ol: HTMLElement): string {
  let result = "";
  let index = 1;
  ol.childNodes.forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === "li") {
      const content = processNode(child);
      result += `${index}. ${content.trim()}\n`;
      index++;
    }
  });
  return result;
}

function processTable(table: HTMLElement): string {
  const rows: string[][] = [];
  let headerRow: string[] | null = null;

  table.querySelectorAll("tr").forEach((tr, rowIndex) => {
    const cells: string[] = [];
    tr.querySelectorAll("th, td").forEach((cell) => {
      cells.push(processNode(cell).trim().replace(/\n/g, " "));
    });

    if (rowIndex === 0 && tr.querySelector("th")) {
      headerRow = cells;
    } else {
      rows.push(cells);
    }
  });

  if (!headerRow && rows.length > 0) {
    headerRow = rows.shift() || [];
  }

  if (!headerRow || headerRow.length === 0) return "";

  let result = `| ${headerRow.join(" | ")} |\n`;
  result += `| ${headerRow.map(() => "---").join(" | ")} |\n`;
  rows.forEach((row) => {
    // Pad row to match header length
    while (row.length < headerRow!.length) row.push("");
    result += `| ${row.join(" | ")} |\n`;
  });

  return result;
}

// Helper: Convert HTML to plain text
function htmlToPlainText(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Replace block elements with newlines
  temp.querySelectorAll("p, div, br, h1, h2, h3, h4, h5, h6, li, tr").forEach((el) => {
    el.insertAdjacentText("afterend", "\n");
  });

  // Replace list items with bullets
  temp.querySelectorAll("li").forEach((el) => {
    const isTaskItem = el.hasAttribute("data-type") && el.getAttribute("data-type") === "taskItem";
    const isChecked = el.getAttribute("data-checked") === "true";
    if (isTaskItem) {
      el.insertAdjacentText("beforebegin", isChecked ? "[x] " : "[ ] ");
    } else {
      el.insertAdjacentText("beforebegin", "• ");
    }
  });

  // Get text content and clean up
  let text = temp.textContent || "";

  // Clean up excessive whitespace while preserving paragraph breaks
  text = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return text;
}

// Helper: Convert HTML to RTF
function htmlToRTF(title: string, content: string, metadata?: { author?: string }): string {
  // RTF header with font table and color table
  let rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033
{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}{\\f1\\fmodern\\fcharset0 Consolas;}}
{\\colortbl ;\\red0\\green0\\blue0;\\red102\\green102\\blue102;\\red0\\green102\\blue204;}
{\\*\\generator Nexustrack Document Export;}
\\viewkind4\\uc1
`;

  // Add title
  rtf += `\\pard\\sa200\\sl276\\slmult1\\qc\\b\\f0\\fs48 ${escapeRTF(title)}\\b0\\par\n`;

  // Add metadata
  if (metadata?.author) {
    rtf += `\\pard\\sa100\\qc\\cf2\\fs20 Author: ${escapeRTF(metadata.author)}\\cf1\\par\n`;
  }

  rtf += `\\pard\\sa200\\sl276\\slmult1\\par\n`;

  // Convert HTML content to RTF
  const temp = document.createElement("div");
  temp.innerHTML = content;
  rtf += processNodeToRTF(temp);

  // Close RTF document
  rtf += "}";

  return rtf;
}

function escapeRTF(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\line ")
    .replace(/[^\x00-\x7F]/g, (char) => `\\u${char.charCodeAt(0)}?`);
}

function processNodeToRTF(node: Node): string {
  let result = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += escapeRTF(child.textContent || "");
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const innerContent = processNodeToRTF(element);

      switch (tagName) {
        case "h1":
          result += `\\pard\\sa200\\sl276\\slmult1\\b\\fs40 ${innerContent}\\b0\\fs22\\par\n`;
          break;
        case "h2":
          result += `\\pard\\sa160\\sl276\\slmult1\\b\\fs32 ${innerContent}\\b0\\fs22\\par\n`;
          break;
        case "h3":
          result += `\\pard\\sa120\\sl276\\slmult1\\b\\fs28 ${innerContent}\\b0\\fs22\\par\n`;
          break;
        case "h4":
          result += `\\pard\\sa100\\sl276\\slmult1\\b\\fs24 ${innerContent}\\b0\\fs22\\par\n`;
          break;
        case "p":
          result += `\\pard\\sa100\\sl276\\slmult1 ${innerContent}\\par\n`;
          break;
        case "strong":
        case "b":
          result += `\\b ${innerContent}\\b0 `;
          break;
        case "em":
        case "i":
          result += `\\i ${innerContent}\\i0 `;
          break;
        case "u":
          result += `\\ul ${innerContent}\\ulnone `;
          break;
        case "s":
        case "strike":
          result += `\\strike ${innerContent}\\strike0 `;
          break;
        case "code":
          result += `\\f1\\fs20 ${innerContent}\\f0\\fs22 `;
          break;
        case "pre":
          result += `\\pard\\sa100\\sl240\\slmult1\\f1\\fs18 ${innerContent}\\f0\\fs22\\par\n`;
          break;
        case "blockquote":
          result += `\\pard\\li720\\ri720\\sa100\\sl276\\slmult1\\cf2\\i ${innerContent}\\i0\\cf1\\par\n`;
          break;
        case "ul":
        case "ol":
          result += innerContent;
          break;
        case "li":
          const isTaskItem = element.hasAttribute("data-type") && element.getAttribute("data-type") === "taskItem";
          const isChecked = element.getAttribute("data-checked") === "true";
          const bullet = isTaskItem ? (isChecked ? "[x] " : "[ ] ") : "\\bullet  ";
          result += `\\pard\\fi-360\\li720\\sa60\\sl276\\slmult1 ${bullet}${innerContent}\\par\n`;
          break;
        case "a":
          const href = element.getAttribute("href") || "";
          result += `\\cf3\\ul ${innerContent}\\cf1\\ulnone `;
          break;
        case "br":
          result += "\\line ";
          break;
        case "hr":
          result += "\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par\n";
          break;
        case "table":
          result += processTableToRTF(element);
          break;
        default:
          result += innerContent;
      }
    }
  });

  return result;
}

function processTableToRTF(table: HTMLElement): string {
  let result = "";
  const rows = table.querySelectorAll("tr");

  rows.forEach((tr, rowIndex) => {
    const cells = tr.querySelectorAll("th, td");
    const cellWidth = Math.floor(9000 / cells.length); // Total width ~9000 twips

    // Start row
    result += "\\trowd\\trgaph70\\trleft0";

    // Define cell boundaries
    cells.forEach((_, i) => {
      result += `\\cellx${cellWidth * (i + 1)}`;
    });

    result += "\n";

    // Add cell content
    cells.forEach((cell) => {
      const isHeader = cell.tagName.toLowerCase() === "th";
      const cellContent = processNodeToRTF(cell);
      if (isHeader) {
        result += `\\pard\\intbl\\b ${cellContent}\\b0\\cell `;
      } else {
        result += `\\pard\\intbl ${cellContent}\\cell `;
      }
    });

    result += "\\row\n";
  });

  return result;
}

// Export format types for UI
export type ExportFormat = "html" | "markdown" | "text" | "pdf" | "word" | "json" | "rtf";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; description: string; icon: string }[] = [
  { value: "pdf", label: "PDF", description: "Best for printing and sharing", icon: "pdf" },
  { value: "word", label: "Word", description: "Microsoft Word compatible", icon: "word" },
  { value: "html", label: "HTML", description: "Web-ready format with styling", icon: "html" },
  { value: "markdown", label: "Markdown", description: "Plain text with formatting", icon: "markdown" },
  { value: "rtf", label: "RTF", description: "Rich Text Format (universal)", icon: "rtf" },
  { value: "text", label: "Plain Text", description: "Simple text without formatting", icon: "text" },
  { value: "json", label: "JSON", description: "Data backup format", icon: "json" },
];

/**
 * Main export function - exports document in specified format
 */
export function exportDocument(
  format: ExportFormat,
  title: string,
  content: string,
  metadata?: { author?: string; createdAt?: string; id?: string; tags?: string[] }
): void {
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
      exportAsPDF(title, content, metadata);
      break;
    case "word":
      exportAsWord(title, content, metadata);
      break;
    case "json":
      exportAsJSON(title, content, metadata);
      break;
    case "rtf":
      exportAsRTF(title, content, metadata);
      break;
  }
}
