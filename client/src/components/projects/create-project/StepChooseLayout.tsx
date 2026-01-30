import { cn } from "@/lib/utils";
import { StepIndicator } from "@/components/ui/step-indicator";
import { LAYOUT_OPTIONS } from "./layout-icons";

interface StepChooseLayoutProps {
  defaultLayout: "list" | "kanban" | "gantt";
  onLayoutChange: (layout: "list" | "kanban" | "gantt") => void;
}

export function StepChooseLayout({ defaultLayout, onLayoutChange }: StepChooseLayoutProps) {
  return (
    <div className="space-y-6 py-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        You can change the default view anytime.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {LAYOUT_OPTIONS.map((layout) => {
          const Icon = layout.icon;
          const isSelected = defaultLayout === layout.id;
          return (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id as "list" | "kanban" | "gantt")}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
              data-testid={`layout-${layout.id}`}
            >
              <div className={cn(
                "w-full h-24 rounded-md flex items-center justify-center",
                isSelected ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"
              )}>
                <Icon className={cn(
                  "w-12 h-12",
                  isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                )} />
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
                )}>
                  {layout.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {layout.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <StepIndicator totalSteps={3} currentStep={3} className="pt-4" />
    </div>
  );
}
