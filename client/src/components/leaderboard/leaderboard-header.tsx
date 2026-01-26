import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface LeaderboardHeaderProps {
  onExport: () => void;
}

export function LeaderboardHeader({ onExport }: LeaderboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Track team performance and productivity metrics</p>
      </div>
      <Button onClick={onExport} variant="outline" className="gap-2" data-testid="button-export">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
