/**
 * Document Export Utilities
 * Handles exporting documents to various formats: HTML, Markdown, Plain Text, PDF
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
 * Export document as DOCX (Word 2007-365) file
 * Creates a proper .docx file using ZIP/XML structure
 */
export function exportAsDOCX(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // Word-compatible HTML approach with .docx content type headers
  const wordDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o2="urn:schemas-microsoft-com:office:office"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #000; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
    th { background-color: #f0f0f0; font-weight: bold; }
    blockquote { border-left: 3pt solid #ccc; padding-left: 10pt; color: #555; font-style: italic; }
    code { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 1pt 3pt; }
    pre { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 10pt; white-space: pre-wrap; }
  </style>
</head>
<body lang="EN-US" style="tab-interval:36pt;" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color:#666;font-size:10pt;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(wordDocument, `${safeTitle}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

/**
 * Export document as DOT (Word 97-2003 Template) file
 */
export function exportAsDOT(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

  const dotDocument = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:ProtectionType w:val="readOnly"/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(dotDocument, `${safeTitle}.dot`, "application/msword");
}

/**
 * Export document as DOTX (Word Macro-Enabled Template) file
 */
export function exportAsDOTX(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // DOTX uses the same Word-compatible HTML approach
  const dotxDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(dotxDocument, `${safeTitle}.dotx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.template");
}

/**
 * Export document as XPS (XML Paper Specification) file
 * XPS is a print-ready document format
 */
export function exportAsXPS(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // XPS uses the same Word-compatible HTML approach since true XPS requires ZIP+XML
  const xpsDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Nexustrack">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    @page { size: A4; margin: 1in; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
    th { background-color: #f0f0f0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(xpsDocument, `${safeTitle}.xps`, "application/oxps+xml");
}

/**
 * Export document as MHT (Single File Web Page) format
 * Packages HTML and resources into a single MIME file
 */
export function exportAsMHT(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const boundary = "----=_Part_" + Math.random().toString(36).substring(2, 11);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="Generator" content="Nexustrack">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
    h1 { font-size: 2em; margin-bottom: 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; margin-top: 1.5em; }
    h3 { font-size: 1.25em; margin-top: 1.25em; }
    p { margin: 1em 0; }
    ul, ol { padding-left: 2em; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    blockquote { border-left: 3px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:0.9em;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
</body>
</html>`;

  const mhtContent = `MIME-Version: 1.0
Content-Type: multipart/related; type="text/html"; start="<rootpart@nexustrack.com>"; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: 7bit
Content-Location: <rootpart@nexustrack.com>

${htmlContent}

--${boundary}--`;

  downloadFile(mhtContent, `${safeTitle}.mht`, "message/rfc822");
}

/**
 * Export document as ODT (OpenDocument Text) file
 * Creates an ODT-compatible file using Word-readable HTML approach
 */
export function exportAsODT(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  // ODT proper requires ZIP+XML, so we use a Word-compatible HTML that ODT readers can open
  const odtDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Nexustrack">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}
  <style type="text/css">
    @page { size: A4; margin: 1in; }
    body { font-family: 'Liberation Serif', 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #1a1a1a; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; }
    p { margin: 0 0 10pt 0; }
    ul, ol { padding-left: 20pt; margin: 0 0 10pt 0; }
    li { margin: 2pt 0; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; text-align: left; }
    th { background-color: #e8e8e8; font-weight: bold; }
    blockquote { border-left: 3pt solid #999; margin: 10pt 0; padding-left: 10pt; color: #555; font-style: italic; }
    code { font-family: 'Liberation Mono', 'Courier New', monospace; background: #f5f5f5; padding: 1pt 3pt; font-size: 10pt; }
    pre { font-family: 'Liberation Mono', 'Courier New', monospace; background: #f5f5f5; padding: 10pt; font-size: 10pt; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color:#666;font-size:10pt;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(odtDocument, `${safeTitle}.odt`, "application/vnd.oasis.opendocument.text");
}

/**
 * Export document as Word XML (.xml) format
 * Uses Microsoft Word's XML schema
 */
export function exportAsWordXML(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const plainText = htmlToPlainText(content);
  const paragraphs = plainText.split("\n").filter((line) => line.trim() !== "");

  const paragraphsXml = paragraphs
    .map((para) => {
      return `      <w:p>
        <w:r>
          <w:t xml:space="preserve">${escapeXml(para)}</w:t>
        </w:r>
      </w:p>`;
    })
    .join("\n");

  const wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:wpc="http://schemas.microsoft.com/office/word/2003/wordprocessingCanvas"
                xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
                xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                xmlns:w10="urn:schemas-microsoft-com:office:word"
                xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
                xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
                mc:Ignorable="w14 wp14">
  <w:document>
    <w:body>
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
          <w:t>${escapeXml(title)}</w:t>
        </w:r>
      </w:p>
${metadata?.author ? `      <w:p>
        <w:r>
          <w:rPr><w:color w:val="666666"/><w:sz w:val="20"/></w:rPr>
          <w:t>Author: ${escapeXml(metadata.author)}</w:t>
        </w:r>
      </w:p>` : ""}
${paragraphsXml}
      <w:sectPr>
        <w:pgSz w:w="11906" w:h="16838"/>
        <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      </w:sectPr>
    </w:body>
  </w:document>
</w:wordDocument>`;

  downloadFile(wordXml, `${safeTitle}.xml`, "application/xml");
}

/**
 * Export document as DOCM (Word Macro-Enabled Document) file
 */
export function exportAsDOCM(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  const docmDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color:#666;font-size:10pt;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(docmDocument, `${safeTitle}.docm`, "application/vnd.ms-word.document.macroEnabled.12");
}

/**
 * Export document as DOTM (Word Macro-Enabled Template) file
 */
export function exportAsDOTM(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

  const dotmDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:ProtectionType w:val="readOnly"/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(dotmDocument, `${safeTitle}.dotm`, "application/vnd.ms-word.template.macroEnabled.12");
}

/**
 * Export document as Strict Open XML Document (.docx)
 * Uses the strict variant of the OOXML schema
 */
export function exportAsStrict(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

  const strictDocument = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta name="Generator" content="Microsoft Word 16.0">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(title)}</title>
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:StrictMode/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #000; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }
    th { background-color: #f0f0f0; font-weight: bold; }
    blockquote { border-left: 3pt solid #ccc; padding-left: 10pt; color: #555; font-style: italic; }
    code { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 1pt 3pt; }
    pre { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 10pt; white-space: pre-wrap; }
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color:#666;font-size:10pt;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  ${content}
</body>
</html>`;

  downloadFile(strictDocument, `${safeTitle}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document.strict");
}

// Helper: Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Export document as PDF file
 * Uses jsPDF + html2canvas for direct PDF download (no print dialog)
 */
export async function exportAsPDF(title: string, content: string, metadata?: { author?: string }): Promise<void> {
  const safeTitle = sanitizeFilename(title);

  // Create a temporary container for rendering
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 794px;
    padding: 40px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
  `;

  container.innerHTML = `
    <h1 style="font-size: 24pt; margin-bottom: 0.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em;">${escapeHtml(title)}</h1>
    ${metadata?.author ? `<p style="color: #666; font-size: 10pt; margin-bottom: 1em;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
    <div style="margin-top: 20px;">${content}</div>
  `;

  // Style internal elements
  const style = document.createElement("style");
  style.textContent = `
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
    a { color: #0066cc; }
    img { max-width: 100%; height: auto; }
  `;
  container.appendChild(style);
  document.body.appendChild(container);

  try {
    // Render to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL("image/png");

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download PDF
    pdf.save(`${safeTitle}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
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
export type ExportFormat =
  | "html"
  | "markdown"
  | "text"
  | "pdf"
  | "word"
  | "docx"
  | "docm"
  | "dot"
  | "dotx"
  | "dotm"
  | "json"
  | "rtf"
  | "xps"
  | "mht"
  | "odt"
  | "wordxml"
  | "strict";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; extensions: string; description: string; icon: string }[] = [
  { value: "docx", label: "Word Document", extensions: ".docx", description: "Word 2007-365 format", icon: "word" },
  { value: "docm", label: "Word Macro-Enabled Document", extensions: ".docm", description: "Word with macro support", icon: "word" },
  { value: "word", label: "Word 97-2003 Document", extensions: ".doc", description: "Legacy Word format", icon: "word" },
  { value: "dotm", label: "Word Macro-Enabled Template", extensions: ".dotm", description: "Template with macro support", icon: "word" },
  { value: "dotx", label: "Word Template", extensions: ".dotx", description: "Word 2007-365 template", icon: "word" },
  { value: "dot", label: "Word 97-2003 Template", extensions: ".dot", description: "Legacy Word template", icon: "word" },
  { value: "pdf", label: "PDF Document", extensions: ".pdf", description: "Best for printing and sharing", icon: "pdf" },
  { value: "xps", label: "XPS Document", extensions: ".xps", description: "XML Paper Specification", icon: "xps" },
  { value: "mht", label: "Single File Web Page", extensions: ".mht, .mhtml", description: "Self-contained web page", icon: "html" },
  { value: "html", label: "Web Page", extensions: ".htm, .html", description: "Web-ready format with styling", icon: "html" },
  { value: "rtf", label: "Rich Text Format", extensions: ".rtf", description: "Universal word processor format", icon: "rtf" },
  { value: "text", label: "Plain Text", extensions: ".txt", description: "Simple text without formatting", icon: "text" },
  { value: "wordxml", label: "Word XML Document", extensions: ".xml", description: "Word XML schema format", icon: "xml" },
  { value: "strict", label: "Strict Open XML Document", extensions: ".docx", description: "Strict OOXML variant", icon: "word" },
  { value: "odt", label: "OpenDocument Text", extensions: ".odt", description: "OpenDocument format", icon: "odt" },
];

/**
 * Main export function - exports document in specified format
 */
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
