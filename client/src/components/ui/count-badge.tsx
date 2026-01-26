import { cn } from "@/lib/utils";

interface CountBadgeProps {
  count: number;
  className?: string;
}

/**
 * Small badge showing a count number
 * Used for filters, selections, notifications, etc.
 */
export function CountBadge({ count, className }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium",
        className
      )}
    >
      {count}
    </span>
  );
}
