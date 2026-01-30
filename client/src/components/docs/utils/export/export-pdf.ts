import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { sanitizeFilename, escapeHtml } from "./helpers";

export async function exportAsPDF(title: string, content: string, metadata?: { author?: string }): Promise<void> {
  const safeTitle = sanitizeFilename(title);

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
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

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

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${safeTitle}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
