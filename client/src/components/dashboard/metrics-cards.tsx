import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Pause, 
  Ban, 
  Eye, 
  AlertTriangle, 
  PieChart 
} from "lucide-react";

interface MetricsCardsProps {
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
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  const cards = [
    {
      title: "Total Tasks",
      value: metrics.totalTasks,
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      testId: "metric-total-tasks"
    },
    {
      title: "Completed",
      value: metrics.completed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      testId: "metric-completed"
    },
    {
      title: "In Progress",
      value: metrics.inProgress,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      testId: "metric-in-progress"
    },
    {
      title: "Not Started",
      value: metrics.notStarted,
      icon: Pause,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-700",
      testId: "metric-not-started"
    },
    {
      title: "Blocked",
      value: metrics.blocked,
      icon: Ban,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-700",
      testId: "metric-blocked"
    },
    {
      title: "Reviewing",
      value: metrics.reviewing,
      icon: Eye,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      testId: "metric-reviewing"
    },
    {
      title: "Design Approval",
      value: metrics.designApprovalNeeded || 0,
      icon: AlertTriangle,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      testId: "metric-design-approval"
    },
    {
      title: "Completion",
      value: `${metrics.completionPercentage}%`,
      icon: PieChart,
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-100 dark:bg-primary-900/30",
      testId: "metric-completion"
    },
  ];

  return (
    <div className="space-y-6 mb-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
          Performance Metrics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time task distribution and completion tracking
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="group relative border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300" data-testid={card.testId}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-4">
                <div className="text-center space-y-3">
                  <div className={`mx-auto w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" data-testid={`${card.testId}-value`}>
                      {card.value}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                      {card.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
