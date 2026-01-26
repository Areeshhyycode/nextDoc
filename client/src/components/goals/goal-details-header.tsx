import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2 } from "lucide-react";

interface GoalDetailsHeaderProps {
  onBack: () => void;
  onEdit: () => void;
}

export function GoalDetailsHeader({ onBack, onEdit }: GoalDetailsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Button>
      </div>
      <Button
        onClick={onEdit}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Edit Goal
      </Button>
    </div>
  );
}
