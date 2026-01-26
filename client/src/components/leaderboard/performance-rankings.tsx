import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerStats {
  owner: string;
  totalTasks: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdueCount: number;
  completionRate: number;
  productivity: number;
  departmentSpread: Record<string, number>;
}

interface PerformanceRankingsProps {
  stats: OwnerStats[];
}

function getRankIcon(index: number) {
  switch (index) {
    case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 1: return <Medal className="h-5 w-5 text-gray-400" />;
    case 2: return <Award className="h-5 w-5 text-amber-600" />;
    default: return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
  }
}

function getPerformanceColor(rate: number) {
  if (rate >= 80) return "text-green-600";
  if (rate >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function PerformanceRankings({ stats }: PerformanceRankingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Rankings</CardTitle>
        <CardDescription>
          Ranked by productivity score (completion rate, recent activity, and quality metrics)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div
              key={stat.owner}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border",
                index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" : "bg-gray-50 dark:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">{getRankIcon(index)}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {stat.owner}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{stat.totalTasks} tasks</span>
                    <span>•</span>
                    <span className={getPerformanceColor(stat.completionRate)}>
                      {stat.completionRate.toFixed(1)}% complete
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stat.completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stat.inProgress}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{stat.notStarted}</p>
                  <p className="text-xs text-gray-500">Not Started</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stat.overdueCount}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>

                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Productivity</span>
                    <span className="font-medium">{stat.productivity.toFixed(0)}</span>
                  </div>
                  <Progress value={stat.productivity} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.entries(stat.departmentSpread)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([dept, count]) => (
                      <Badge key={dept} variant="secondary" className="text-xs">
                        {dept}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
