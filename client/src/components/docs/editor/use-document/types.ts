import type { Document, LastUpdaterInfo } from "@shared/schema";
import type { PageStyles } from "@/components/docs/components/page-styles-panel";

export type { PageStyles };

/** Document with permission info returned from the API */
export type DocumentWithPermission = Document & {
  userPermission?: "owner" | "view" | "edit" | "comment" | "edit_comment";
  owner: { id: string; displayName: string; email: string; profilePicture: string | null } | null;
  lastUpdater?: LastUpdaterInfo | null;
};

export const DEFAULT_PAGE_STYLES: PageStyles = {
  fontStyle: "system",
  fontSize: "default",
  pageWidth: "default",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  headingColor: "#111827",
  h1Color: "#111827",
  h2Color: "#1f2937",
  h3Color: "#374151",
  h4Color: "#4b5563",
  h5Color: "#6b7280",
  h6Color: "#9ca3af",
  linkColor: "#3b82f6",
  codeBlockBg: "#f3f4f6",
  codeBlockText: "#1f2937",
  blockquoteBg: "#f9fafb",
  blockquoteText: "#4b5563",
  tableBorderColor: "#e5e7eb",
  tableHeaderBg: "#f3f4f6",
  showPageOutline: false,
};
