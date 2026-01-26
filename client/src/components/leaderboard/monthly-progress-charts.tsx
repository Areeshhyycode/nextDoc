import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MonthlyData {
  month: string;
  completed: number;
  total: number;
  inProgress: number;
  blocked: number;
  completionRate: number;
}

interface MonthlyProgressChartsProps {
  data: MonthlyData[];
}

const chartTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
};

export function MonthlyProgressCharts({ data }: MonthlyProgressChartsProps) {
  const bestMonth = data.length > 0
    ? data.reduce((best, current) => current.completionRate > best.completionRate ? current : best)
    : null;
  const totalTasks = data.reduce((sum, month) => sum + month.total, 0);
  const avgCompletion = data.length > 0
    ? Math.round(data.reduce((sum, month) => sum + month.completionRate, 0) / data.length)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Monthly Progress Trends
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Task completion and activity overview by month
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value, name) => [
                  value,
                  name === 'completed' ? 'Completed' :
                  name === 'inProgress' ? 'In Progress' :
                  name === 'blocked' ? 'Blocked' : 'Total'
                ]}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
              <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[2, 2, 0, 0]} />
              <Bar dataKey="blocked" fill="#ef4444" name="Blocked" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 h-60 w-full">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Completion Rate Trend
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) => [`${value}%`, 'Completion Rate']}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-400">Best Month</span>
            </div>
            <div className="mt-1">
              {bestMonth && (
                <>
                  <div className="text-lg font-bold text-green-900 dark:text-green-300">{bestMonth.month}</div>
                  <div className="text-sm text-green-700 dark:text-green-400">{bestMonth.completionRate}% completion rate</div>
                </>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Total Tasks</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-300">{totalTasks}</div>
              <div className="text-sm text-blue-700 dark:text-blue-400">Across all months</div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-400">Avg Completion</span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-purple-900 dark:text-purple-300">{avgCompletion}%</div>
              <div className="text-sm text-purple-700 dark:text-purple-400">Overall average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
