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
