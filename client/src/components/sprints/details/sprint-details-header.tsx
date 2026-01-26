import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, CheckCircle, Edit2 } from "lucide-react";

interface SprintDetailsHeaderProps {
  status: string;
  onBack: () => void;
  onStartSprint: () => void;
  onCompleteSprint: () => void;
  onEdit: () => void;
}

export function SprintDetailsHeader({
  status,
  onBack,
  onStartSprint,
  onCompleteSprint,
  onEdit
}: SprintDetailsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calendar
        </Button>
      </div>
      <div className="flex gap-3">
        {status === 'Planning' && (
          <Button
            onClick={onStartSprint}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Sprint
          </Button>
        )}
        {status === 'Active' && (
          <Button onClick={onCompleteSprint} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Sprint
          </Button>
        )}
        <Button
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Sprint
        </Button>
      </div>
    </div>
  );
}
