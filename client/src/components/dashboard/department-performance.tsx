import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase } from "lucide-react";

interface DepartmentData {
  total: number;
  completed: number;
}

interface DepartmentPerformanceProps {
  departmentBreakdown: Record<string, DepartmentData>;
}

export function DepartmentPerformance({ departmentBreakdown }: DepartmentPerformanceProps) {
  const sortedDepts = Object.entries(departmentBreakdown)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4);

  return (
    <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100 text-base sm:text-lg">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          Department Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {sortedDepts.map(([dept, data]) => {
          const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
          return (
            <div key={dept} className="group/dept space-y-2 sm:space-y-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{dept}</span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(completionRate)}%</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{data.completed}/{data.total}</span>
                </div>
              </div>
              <Progress value={completionRate} className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
