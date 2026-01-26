import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

interface GoalsPageHeaderProps {
  onCreateGoal: () => void;
}

export function GoalsPageHeader({ onCreateGoal }: GoalsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
          <Target className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          Goals & OKRs
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Track objectives and key results across your organization
        </p>
      </div>
      <Button
        onClick={onCreateGoal}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-11 sm:h-10 w-full sm:w-auto text-[15px] sm:text-sm font-medium"
        data-testid="create-goal-button"
      >
        <Plus className="h-5 w-5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
        New Goal
      </Button>
    </div>
  );
}
