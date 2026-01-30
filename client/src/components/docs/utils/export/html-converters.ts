/** Convert HTML to Markdown */
export function htmlToMarkdown(html: string): string {
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
        case "blockquote": {
          const lines = innerContent.trim().split("\n");
          result += lines.map((line) => `> ${line}`).join("\n") + "\n\n";
          break;
        }
        case "ul":
          result += `\n${innerContent}`;
          break;
        case "ol":
          result += `\n${processOrderedList(element)}`;
          break;
        case "li": {
          const isTaskItem = element.hasAttribute("data-type") && element.getAttribute("data-type") === "taskItem";
          const isChecked = element.getAttribute("data-checked") === "true";
          if (isTaskItem) {
            result += `- [${isChecked ? "x" : " "}] ${innerContent.trim()}\n`;
          } else if (element.parentElement?.tagName.toLowerCase() === "ol") {
            result += innerContent;
          } else {
            result += `- ${innerContent.trim()}\n`;
          }
          break;
        }
        case "a": {
          const href = element.getAttribute("href") || "";
          result += `[${innerContent}](${href})`;
          break;
        }
        case "img": {
          const src = element.getAttribute("src") || "";
          const alt = element.getAttribute("alt") || "";
          result += `![${alt}](${src})`;
          break;
        }
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
    while (row.length < headerRow!.length) row.push("");
    result += `| ${row.join(" | ")} |\n`;
  });

  return result;
}

/** Convert HTML to plain text */
export function htmlToPlainText(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  temp.querySelectorAll("p, div, br, h1, h2, h3, h4, h5, h6, li, tr").forEach((el) => {
    el.insertAdjacentText("afterend", "\n");
  });

  temp.querySelectorAll("li").forEach((el) => {
    const isTaskItem = el.hasAttribute("data-type") && el.getAttribute("data-type") === "taskItem";
    const isChecked = el.getAttribute("data-checked") === "true";
    if (isTaskItem) {
      el.insertAdjacentText("beforebegin", isChecked ? "[x] " : "[ ] ");
    } else {
      el.insertAdjacentText("beforebegin", "• ");
    }
  });

  let text = temp.textContent || "";

  text = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return text;
}
