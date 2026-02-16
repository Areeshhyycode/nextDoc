import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ImportModalFooterProps {
  onNext: () => void;
  disabled: boolean;
  isLoading: boolean;
  loadingText?: string;
  buttonText?: string;
}

export function ImportModalFooter({
  onNext,
  disabled,
  isLoading,
  loadingText = "Importing...",
  buttonText = "Next",
}: ImportModalFooterProps) {
  return (
    <div className="px-4 sm:px-8 pb-4 sm:pb-8 flex justify-center">
      <Button
        onClick={onNext}
        disabled={disabled || isLoading}
        className="h-10 sm:h-11 w-full sm:w-auto px-6 sm:px-8 gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? loadingText : buttonText}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}
