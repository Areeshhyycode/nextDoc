import { downloadFile, sanitizeFilename, escapeHtml, escapeXml } from "./helpers";
import { htmlToPlainText } from "./html-converters";
import { htmlToRTF } from "./rtf-converter";

/** Export as JSON */
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

/** Export as RTF */
export function exportAsRTF(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const rtfContent = htmlToRTF(title, content, metadata);
  downloadFile(rtfContent, `${safeTitle}.rtf`, "application/rtf");
}

/** Export as XPS */
export function exportAsXPS(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);

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

/** Export as MHT (Single File Web Page) */
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

/** Export as ODT (OpenDocument Text) */
export function exportAsODT(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

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

/** Export as Word XML (.xml) */
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
