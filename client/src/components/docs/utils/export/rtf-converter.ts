/** Convert HTML to RTF document string */
export function htmlToRTF(title: string, content: string, metadata?: { author?: string }): string {
  let rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033
{\\fonttbl{\\f0\\fswiss\\fcharset0 Calibri;}{\\f1\\fmodern\\fcharset0 Consolas;}}
{\\colortbl ;\\red0\\green0\\blue0;\\red102\\green102\\blue102;\\red0\\green102\\blue204;}
{\\*\\generator Nexustrack Document Export;}
\\viewkind4\\uc1
`;

  rtf += `\\pard\\sa200\\sl276\\slmult1\\qc\\b\\f0\\fs48 ${escapeRTF(title)}\\b0\\par\n`;

  if (metadata?.author) {
    rtf += `\\pard\\sa100\\qc\\cf2\\fs20 Author: ${escapeRTF(metadata.author)}\\cf1\\par\n`;
  }

  rtf += `\\pard\\sa200\\sl276\\slmult1\\par\n`;

  const temp = document.createElement("div");
  temp.innerHTML = content;
  rtf += processNodeToRTF(temp);

  rtf += "}";

  return rtf;
}

export function escapeRTF(text: string): string {
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
        case "li": {
          const isTaskItem = element.hasAttribute("data-type") && element.getAttribute("data-type") === "taskItem";
          const isChecked = element.getAttribute("data-checked") === "true";
          const bullet = isTaskItem ? (isChecked ? "[x] " : "[ ] ") : "\\bullet  ";
          result += `\\pard\\fi-360\\li720\\sa60\\sl276\\slmult1 ${bullet}${innerContent}\\par\n`;
          break;
        }
        case "a":
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

  rows.forEach((tr) => {
    const cells = tr.querySelectorAll("th, td");
    const cellWidth = Math.floor(9000 / cells.length);

    result += "\\trowd\\trgaph70\\trleft0";

    cells.forEach((_, i) => {
      result += `\\cellx${cellWidth * (i + 1)}`;
    });

    result += "\n";

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
