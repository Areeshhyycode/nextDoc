import { Copy } from "lucide-react";

interface DuplicateNameBadgeProps {
  compact?: boolean;
}

export function DuplicateNameBadge({ compact = false }: DuplicateNameBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 flex-shrink-0"
      title="There are other documents with a similar name"
    >
      <Copy className="h-3 w-3 text-amber-600 dark:text-amber-400" />
      {!compact && (
        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
          Duplicate name
        </span>
      )}
    </div>
  );
}
