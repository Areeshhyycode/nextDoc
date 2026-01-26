import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, TrendingDown, Award } from "lucide-react";

interface OwnerStats {
  totalTasks: number;
  completionRate: number;
  overdueCount: number;
}

interface LeaderboardSummaryCardsProps {
  stats: OwnerStats[];
}

export function LeaderboardSummaryCards({ stats }: LeaderboardSummaryCardsProps) {
  const avgCompletionRate = stats.length > 0
    ? (stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length).toFixed(1)
    : "0";
  const totalTasks = stats.reduce((sum, s) => sum + s.totalTasks, 0);
  const totalOverdue = stats.reduce((sum, s) => sum + s.overdueCount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contributors</p>
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Completion Rate</p>
              <p className="text-2xl font-bold">{avgCompletionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Overdue</p>
              <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
