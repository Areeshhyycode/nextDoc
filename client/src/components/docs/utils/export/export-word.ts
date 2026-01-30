import { downloadFile, sanitizeFilename, escapeHtml } from "./helpers";

/** Export as Word 97-2003 (.doc) */
export function exportAsWord(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);

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
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
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

  downloadFile(wordDocument, `${safeTitle}.doc`, "application/msword");
}

/** Shared Word XML preamble for modern Word formats */
function wordXmlPreamble(title: string, metadata?: { author?: string }) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
  ${metadata?.author ? `<meta name="author" content="${escapeHtml(metadata.author)}">` : ""}`;
}

/** Shared Word body styles */
const WORD_BODY_STYLES = `
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
    pre { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 10pt; white-space: pre-wrap; }`;

/** Build a complete Word-compatible HTML document */
function buildWordDoc(
  title: string,
  content: string,
  metadata?: { author?: string; createdAt?: string },
  extraXml?: string,
  extraStyles?: string,
) {
  return `${wordXmlPreamble(title, metadata)}
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>${extraXml ? `\n      ${extraXml}` : ""}
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style type="text/css">${extraStyles || WORD_BODY_STYLES}
  </style>
</head>
<body lang="EN-US" class="WordSection1">
  <h1>${escapeHtml(title)}</h1>
  ${metadata?.author ? `<p style="color:#666;font-size:10pt;">Author: ${escapeHtml(metadata.author)}</p>` : ""}
  ${metadata?.createdAt ? `<p style="color:#666;font-size:10pt;">Created: ${new Date(metadata.createdAt).toLocaleDateString()}</p>` : ""}
  ${content}
</body>
</html>`;
}

/** Export as DOCX (.docx) */
export function exportAsDOCX(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const doc = buildWordDoc(title, content, metadata, "<w:DoNotOptimizeForBrowser/>");
  downloadFile(doc, `${safeTitle}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

/** Export as DOCM (.docm) */
export function exportAsDOCM(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const doc = buildWordDoc(title, content, metadata);
  downloadFile(doc, `${safeTitle}.docm`, "application/vnd.ms-word.document.macroEnabled.12");
}

/** Export as DOT (.dot — Word 97-2003 Template) */
export function exportAsDOT(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const templateStyles = `
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }`;
  const doc = buildWordDoc(title, content, metadata, `<w:ProtectionType w:val="readOnly"/>`, templateStyles);
  downloadFile(doc, `${safeTitle}.dot`, "application/msword");
}

/** Export as DOTX (.dotx — Word Template) */
export function exportAsDOTX(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const simpleStyles = `
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }`;
  const doc = buildWordDoc(title, content, metadata, undefined, simpleStyles);
  downloadFile(doc, `${safeTitle}.dotx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.template");
}

/** Export as DOTM (.dotm — Word Macro-Enabled Template) */
export function exportAsDOTM(title: string, content: string, metadata?: { author?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const simpleStyles = `
    @page WordSection1 { size: A4; margin: 1in; }
    DIV.WordSection1 { page: WordSection1; }
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; }
    p { margin: 0 0 10pt 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1pt solid #000; padding: 5pt 8pt; }`;
  const doc = buildWordDoc(title, content, metadata, `<w:ProtectionType w:val="readOnly"/>`, simpleStyles);
  downloadFile(doc, `${safeTitle}.dotm`, "application/vnd.ms-word.template.macroEnabled.12");
}

/** Export as Strict Open XML (.docx strict variant) */
export function exportAsStrict(title: string, content: string, metadata?: { author?: string; createdAt?: string }): void {
  const safeTitle = sanitizeFilename(title);
  const doc = buildWordDoc(title, content, metadata, "<w:StrictMode/>");
  downloadFile(doc, `${safeTitle}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document.strict");
}
