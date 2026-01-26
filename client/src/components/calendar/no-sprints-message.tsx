import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoSprintsMessageProps {
  teamMember: string;
  onShowAll: () => void;
}

export function NoSprintsMessage({ teamMember, onShowAll }: NoSprintsMessageProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Sprints Found</h3>
        <p className="text-sm">{teamMember} is not assigned to any sprints currently.</p>
        <Button variant="outline" size="sm" onClick={onShowAll} className="mt-4">
          View All Sprints
        </Button>
      </div>
    </div>
  );
}
