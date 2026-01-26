import { useQuery } from "@tanstack/react-query";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { Performance360 } from "@/components/dashboard/performance-360";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { PriorityAlerts } from "@/components/dashboard/priority-alerts";
import { DepartmentPerformance } from "@/components/dashboard/department-performance";
import { RiskDistribution } from "@/components/dashboard/risk-distribution";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { AnimatedBackground } from "@/components/dashboard/animated-background";
import { useAdvancedMetrics } from "@/hooks/use-advanced-metrics";
import { type Project } from "@shared/schema";

interface Metrics {
  totalTasks: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  reviewing: number;
  designApprovalNeeded: number;
  temporaryHold: number;
  completionPercentage: number;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({ queryKey: ['/api/metrics'] });
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({ queryKey: ['/api/projects'] });
  const advancedMetrics = useAdvancedMetrics(projects, metrics);

  if (metricsLoading || projectsLoading) return <DashboardLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <AnimatedBackground />

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <DashboardHero
          avgCompletionRate={advancedMetrics?.avgCompletionRate || 0}
          activeMembers={advancedMetrics?.activeMembers || 0}
          overdueTasks={advancedMetrics?.overdueTasks || 0}
        />

        <MetricsCards metrics={metrics} isLoading={metricsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <PriorityAlerts
            overdueTasks={advancedMetrics?.overdueTasks || 0}
            dueThisWeek={advancedMetrics?.dueThisWeek || 0}
            blockedTasks={metrics?.blocked || 0}
          />
          {advancedMetrics && <DepartmentPerformance departmentBreakdown={advancedMetrics.departmentBreakdown} />}
          {advancedMetrics && <RiskDistribution riskLevels={advancedMetrics.riskLevels} />}
        </div>

        {advancedMetrics && <ProductivityChart data={advancedMetrics.productivityTrend} />}

        <Performance360 projects={projects} metrics={metrics} />
        <ChartsSection metrics={metrics} projects={projects} isLoading={metricsLoading || projectsLoading} />
      </div>
    </div>
  );
}
