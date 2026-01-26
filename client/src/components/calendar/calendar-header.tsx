import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  onCreateSprint: () => void;
}

export function CalendarHeader({ onCreateSprint }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          Calendar & Sprints
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Schedule tasks and manage sprints with drag-and-drop planning
        </p>
      </div>
      <Button
        onClick={onCreateSprint}
        className="bg-green-600 hover:bg-green-700 text-white"
        data-testid="create-sprint-button"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Sprint
      </Button>
    </div>
  );
}
