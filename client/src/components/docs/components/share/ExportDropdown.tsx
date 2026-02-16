import { useState, useEffect, useRef } from "react";
import {
  Download,
  Loader2,
  FileText,
  FileCode,
  FileType,
  FileSpreadsheet,
  File,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportDocument, type ExportFormat } from "../../utils/export-utils";
import type { DocumentWithOwner } from "@shared/schema";

const EXPORT_FORMATS = [
  { format: "docx" as ExportFormat, label: "Word Document", ext: ".docx", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "docm" as ExportFormat, label: "Word Macro Doc", ext: ".docm", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "word" as ExportFormat, label: "Word 97-2003", ext: ".doc", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "dotm" as ExportFormat, label: "Word Macro Tmpl", ext: ".dotm", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "dotx" as ExportFormat, label: "Word Template", ext: ".dotx", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "dot" as ExportFormat, label: "Word 97-2003 Tmpl", ext: ".dot", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "pdf" as ExportFormat, label: "PDF Document", ext: ".pdf", Icon: FileText, color: "text-red-400" },
  { format: "xps" as ExportFormat, label: "XPS Document", ext: ".xps", Icon: FileText, color: "text-teal-400" },
  { format: "mht" as ExportFormat, label: "Single File Web", ext: ".mht", Icon: FileCode, color: "text-orange-400" },
  { format: "html" as ExportFormat, label: "Web Page", ext: ".htm", Icon: FileCode, color: "text-orange-400" },
  { format: "rtf" as ExportFormat, label: "Rich Text Format", ext: ".rtf", Icon: FileType, color: "text-purple-400" },
  { format: "text" as ExportFormat, label: "Plain Text", ext: ".txt", Icon: File, color: "text-gray-400" },
  { format: "wordxml" as ExportFormat, label: "Word XML", ext: ".xml", Icon: FileCode, color: "text-green-400" },
  { format: "strict" as ExportFormat, label: "Strict Open XML", ext: ".docx", Icon: FileSpreadsheet, color: "text-teal-400" },
  { format: "odt" as ExportFormat, label: "OpenDocument", ext: ".odt", Icon: FileSpreadsheet, color: "text-emerald-400" },
];

interface ExportDropdownProps {
  doc: DocumentWithOwner;
}

export function ExportDropdown({ doc }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      let content = doc.content || "";
      if (!content) {
        const response = await fetch(`/api/docs/${doc.id}`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch document");
        const fullDoc = await response.json();
        content = fullDoc.content || "";
      }
      exportDocument(format, doc.title || "Untitled", content, {
        author: doc.owner?.displayName,
        createdAt: doc.createdAt?.toString(),
      });
      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex justify-end relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm bg-[#2a2a2a] border border-[#444] text-white rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors"
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Export
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-48 bg-[#252525] border border-[#3a3a3a] rounded-lg shadow-xl z-50" style={{ maxHeight: '96px', overflowY: 'auto' }}>
          {EXPORT_FORMATS.map((item) => (
            <button
              key={item.format}
              onClick={() => { handleExport(item.format); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1 text-left hover:bg-[#333] transition-colors"
            >
              <item.Icon className={`h-3 w-3 ${item.color} flex-shrink-0`} />
              <span className="text-[11px] text-gray-300 truncate flex-1">{item.label}</span>
              <span className="text-[9px] text-gray-600 flex-shrink-0">{item.ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
