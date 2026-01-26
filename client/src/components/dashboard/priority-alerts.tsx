import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface AlertItemProps {
  label: string;
  count: number;
  dotColor: string;
  variant: "destructive" | "outline";
  badgeClassName?: string;
}

function AlertItem({ label, count, dotColor, variant, badgeClassName }: AlertItemProps) {
  return (
    <div className="group/item flex items-center justify-between p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${dotColor} rounded-full ${dotColor.includes('red') ? 'animate-pulse' : ''} flex-shrink-0`} />
        <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{label}</span>
      </div>
      <Badge variant={variant} className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold flex-shrink-0 ${badgeClassName || ''}`}>
        {count}
      </Badge>
    </div>
  );
}

interface PriorityAlertsProps {
  overdueTasks: number;
  dueThisWeek: number;
  blockedTasks: number;
}

export function PriorityAlerts({ overdueTasks, dueThisWeek, blockedTasks }: PriorityAlertsProps) {
  return (
    <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-red-50/80 via-orange-50/80 to-pink-50/80 dark:from-red-950/50 dark:via-orange-950/50 dark:to-pink-950/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-red-700 dark:text-red-400 text-base sm:text-lg">
          <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          Priority Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
        <AlertItem label="Overdue Tasks" count={overdueTasks} dotColor="bg-red-500" variant="destructive" />
        <AlertItem label="Due This Week" count={dueThisWeek} dotColor="bg-yellow-500" variant="outline" badgeClassName="border-yellow-300 text-yellow-700 dark:text-yellow-400" />
        <AlertItem label="Blocked Tasks" count={blockedTasks} dotColor="bg-red-500" variant="destructive" />
      </CardContent>
    </Card>
  );
}
