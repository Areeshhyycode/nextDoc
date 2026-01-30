import { downloadFile, sanitizeFilename, escapeHtml } from "./helpers";

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
