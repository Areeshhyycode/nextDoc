import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

/**
 * Progress dots indicator for multi-step forms/wizards
 */
export function StepIndicator({ totalSteps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            index + 1 === currentStep
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-gray-600"
          )}
        />
      ))}
    </div>
  );
}
