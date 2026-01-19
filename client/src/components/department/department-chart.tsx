import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { type Project } from "@shared/schema";

interface DepartmentChartProps {
  projects: Project[];
  color: string;
  department: string;
}

export function DepartmentChart({ projects, color, department }: DepartmentChartProps) {
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: Math.round((count / projects.length) * 100) || 0
  }));

  const statusColors = {
    "Completed": "#10b981",
    "In Progress": "#3b82f6", 
    "Not Started": "#6b7280",
    "Blocked": "#ef4444",
    "Reviewing": "#f59e0b",
    "Design Approval Needed": "#8b5cf6",
    "Temporary Hold": "#f97316"
  };

  const totalCompleted = projects.filter(p => p.status === "Completed").length;
  const completionRate = projects.length > 0 ? Math.round((totalCompleted / projects.length) * 100) : 0;

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {department} Overview
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No tasks yet. Create your first task to see metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {department} Overview
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color }}>
            {completionRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Completion Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {projects.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Tasks
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {totalCompleted}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Status Breakdown</h4>
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: statusColors[item.name as keyof typeof statusColors] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={statusColors[entry.name as keyof typeof statusColors]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} tasks`, name]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}