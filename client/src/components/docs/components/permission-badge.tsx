import { Eye, Pencil, MessageSquare, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

type Permission = "view" | "edit" | "comment" | "edit_comment" | "owner";

interface PermissionBadgeProps {
  permission: Permission;
}

const PERMISSION_CONFIG = {
  view: { icon: Eye, label: "View only", className: "bg-amber-50/95 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700" },
  edit: { icon: Pencil, label: "Can edit", className: "bg-emerald-50/95 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" },
  comment: { icon: MessageSquare, label: "Can comment", className: "bg-teal-50/95 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700" },
  edit_comment: { icon: PenLine, label: "Can edit & comment", className: "bg-purple-50/95 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700" },
} as const;

export function PermissionBadge({ permission }: PermissionBadgeProps) {
  if (permission === "owner") return null;

  const config = PERMISSION_CONFIG[permission];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-md border backdrop-blur-sm",
        config.className
      )}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    </div>
  );
}
