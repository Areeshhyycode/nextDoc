import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ChartsSectionProps {
  metrics?: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    reviewing: number;
    designApprovalNeeded?: number;
    temporaryHold: number;
    completionPercentage: number;
  };
  projects?: any[];
  isLoading?: boolean;
}

export function ChartsSection({ metrics, isLoading }: ChartsSectionProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center justify-center">
                <div className="animate-pulse w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statusData = [
    { name: "Completed", value: metrics.completed, color: "#10B981" },
    { name: "In Progress", value: metrics.inProgress, color: "#3B82F6" },
    { name: "Not Started", value: metrics.notStarted, color: "#6B7280" },
    { name: "Reviewing", value: metrics.reviewing, color: "#F59E0B" },
    { name: "Blocked", value: metrics.blocked, color: "#EF4444" },
    { name: "Design Approval", value: metrics.designApprovalNeeded || 0, color: "#8B5CF6" },
    { name: "Temporary Hold", value: metrics.temporaryHold, color: "#F97316" },
  ].filter(item => item.value > 0);

  const completionData = [
    { name: "Completed", value: metrics.completionPercentage, color: "#10B981" },
    { name: "Remaining", value: 100 - metrics.completionPercentage, color: "#E5E7EB" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Data Visualization
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800" data-testid="chart-task-status">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800" data-testid="chart-completion">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Overall Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Complete
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {completionData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
