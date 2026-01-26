import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface SelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Reusable selection card for options like privacy settings, layouts, etc.
 */
export function SelectionCard({
  isSelected,
  onClick,
  icon: Icon,
  title,
  description,
  children,
  className,
  testId,
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-4 rounded-lg border transition-colors text-left",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        className
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isSelected
            ? "bg-blue-100 dark:bg-blue-900/30"
            : "bg-gray-100 dark:bg-gray-800"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isSelected
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </div>
        {children}
      </div>
    </button>
  );
}
