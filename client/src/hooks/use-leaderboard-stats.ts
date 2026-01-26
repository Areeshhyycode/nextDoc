import { useMemo } from "react";
import { parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from "date-fns";
import type { Project } from "@shared/schema";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface OwnerStats {
  owner: string;
  totalTasks: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  reviewing: number;
  completionRate: number;
  overdueCount: number;
  avgCompletionTime: number;
  departmentSpread: Record<string, number>;
  riskDistribution: Record<string, number>;
  stageDistribution: Record<string, number>;
  recentActivity: number;
  productivity: number;
}

export interface MonthlyData {
  month: string;
  completed: number;
  total: number;
  inProgress: number;
  blocked: number;
  completionRate: number;
}

// Owner name consolidation mapping
function consolidateOwnerName(owner: string): string {
  const normalizedOwner = owner.trim().toLowerCase();

  if (normalizedOwner.includes('zara.amirzade@cyberbay.tech') ||
      normalizedOwner === 'zara a' ||
      normalizedOwner === 'zara a.') {
    return 'Zara A';
  }

  if (normalizedOwner.includes('shaharyar') ||
      normalizedOwner === 'brett' ||
      normalizedOwner.includes('shaharyar.asgher@cyberbay.tech')) {
    return 'Shaharyar Asgher';
  }

  if (normalizedOwner.includes('tom@cyberbay.tech') ||
      normalizedOwner === 'tom austin') {
    return 'Tom Austin';
  }

  if (normalizedOwner.includes('quang@cyberbay.tech') ||
      normalizedOwner.includes('quang (brett) ngo')) {
    return 'Quang (Brett) Ngo';
  }

  if (normalizedOwner.includes('dillon.bong@cyberbay.tech') ||
      normalizedOwner === 'dillon bong') {
    return 'Dillon Bong';
  }

  if (normalizedOwner.includes('thuy (sweet) phan thanh') ||
      normalizedOwner.includes('thuy.phanthithanh@cyberbay.tech')) {
    return 'Thuy (Sweet) Phan Thanh';
  }

  return owner.trim();
}

interface UseLeaderboardStatsParams {
  projects: Project[];
  filterType: "month" | "custom";
  selectedMonth: string;
  dateRange: DateRange;
}

export function useLeaderboardStats({
  projects,
  filterType,
  selectedMonth,
  dateRange
}: UseLeaderboardStatsParams) {
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (!project.dueDate) return true;

      const projectDate = parseISO(project.dueDate);

      if (filterType === "month" && selectedMonth !== "all") {
        const monthsAgo = parseInt(selectedMonth);
        const targetMonth = subMonths(new Date(), monthsAgo);
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);
        return isWithinInterval(projectDate, { start: monthStart, end: monthEnd });
      }

      if (filterType === "custom" && dateRange.from && dateRange.to) {
        return isWithinInterval(projectDate, { start: dateRange.from, end: dateRange.to });
      }

      return true;
    });
  }, [projects, filterType, selectedMonth, dateRange]);

  const ownerStats = useMemo(() => {
    const ownerStatsMap = filteredProjects.reduce((acc, project) => {
      if (!project.owner) return acc;

      const owners = project.owner.split(',').map(o => consolidateOwnerName(o));

      owners.forEach(owner => {
        if (!acc[owner]) {
          acc[owner] = {
            owner,
            totalTasks: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            blocked: 0,
            reviewing: 0,
            completionRate: 0,
            overdueCount: 0,
            avgCompletionTime: 0,
            departmentSpread: {},
            riskDistribution: {},
            stageDistribution: {},
            recentActivity: 0,
            productivity: 0,
          };
        }

        const stats = acc[owner];
        stats.totalTasks++;

        switch (project.status) {
          case "Completed":
            stats.completed++;
            break;
          case "In Progress":
            stats.inProgress++;
            break;
          case "Not Started":
            stats.notStarted++;
            break;
          case "Blocked":
            stats.blocked++;
            break;
          case "Reviewing":
            stats.reviewing++;
            break;
        }

        stats.departmentSpread[project.department] = (stats.departmentSpread[project.department] || 0) + 1;

        if (project.risk) {
          stats.riskDistribution[project.risk] = (stats.riskDistribution[project.risk] || 0) + 1;
        }

        if (project.stage) {
          stats.stageDistribution[project.stage] = (stats.stageDistribution[project.stage] || 0) + 1;
        }

        if (project.dueDate && project.status !== "Completed") {
          const dueDate = parseISO(project.dueDate);
          if (dueDate < new Date()) {
            stats.overdueCount++;
          }
        }

        if (project.lastUpdated) {
          const lastUpdate = new Date(project.lastUpdated);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (lastUpdate > thirtyDaysAgo) {
            stats.recentActivity++;
          }
        }
      });

      return acc;
    }, {} as Record<string, OwnerStats>);

    return Object.values(ownerStatsMap)
      .map((stats: OwnerStats) => {
        stats.completionRate = stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0;

        const completionWeight = 0.4;
        const activityWeight = 0.3;
        const qualityWeight = 0.3;

        const completionScore = stats.completionRate;
        const activityScore = Math.min((stats.recentActivity / Math.max(stats.totalTasks, 1)) * 100, 100);
        const qualityScore = Math.max(100 - (stats.overdueCount / Math.max(stats.totalTasks, 1)) * 100, 0);

        stats.productivity = (completionScore * completionWeight) + (activityScore * activityWeight) + (qualityScore * qualityWeight);

        return stats;
      })
      .filter((stats: OwnerStats) => stats.totalTasks > 0)
      .sort((a: OwnerStats, b: OwnerStats) => b.productivity - a.productivity);
  }, [filteredProjects]);

  const monthlyProgressData = useMemo(() => {
    const monthlyData: Record<string, { completed: number; total: number; inProgress: number; blocked: number }> = {};

    filteredProjects.forEach(project => {
      const taskDate = project.dueDate ? parseISO(project.dueDate) : new Date();
      const monthKey = format(taskDate, "MMM yyyy");

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { completed: 0, total: 0, inProgress: 0, blocked: 0 };
      }

      monthlyData[monthKey].total++;

      switch (project.status) {
        case "Completed":
          monthlyData[monthKey].completed++;
          break;
        case "In Progress":
        case "Reviewing":
          monthlyData[monthKey].inProgress++;
          break;
        case "Blocked":
          monthlyData[monthKey].blocked++;
          break;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        completed: data.completed,
        total: data.total,
        inProgress: data.inProgress,
        blocked: data.blocked,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredProjects]);

  return { filteredProjects, ownerStats, monthlyProgressData };
}

export function exportLeaderboardCSV(ownerStats: OwnerStats[]) {
  const csvData = [
    ["Rank", "Owner", "Total Tasks", "Completed", "Completion Rate", "In Progress", "Overdue", "Productivity Score", "Top Department"].join(","),
    ...ownerStats.map((stats, index) => [
      index + 1,
      stats.owner,
      stats.totalTasks,
      stats.completed,
      `${stats.completionRate.toFixed(1)}%`,
      stats.inProgress,
      stats.overdueCount,
      stats.productivity.toFixed(1),
      Object.entries(stats.departmentSpread).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leaderboard-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
