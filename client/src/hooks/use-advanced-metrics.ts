import { useMemo } from "react";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
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

export interface AdvancedMetrics {
  overdueTasks: number;
  dueThisWeek: number;
  departmentBreakdown: Record<string, { total: number; completed: number }>;
  riskLevels: Record<string, number>;
  activeMembers: number;
  productivityTrend: { day: string; completed: number; created: number }[];
  avgCompletionRate: number;
}

export function useAdvancedMetrics(projects: Project[], metrics: Metrics | undefined): AdvancedMetrics | null {
  return useMemo(() => {
    if (!projects || !metrics) return null;

    const today = new Date();

    const overdueTasks = projects.filter(p =>
      p.dueDate && p.status !== "Completed" && isBefore(parseISO(p.dueDate), today)
    ).length;

    const dueThisWeek = projects.filter(p =>
      p.dueDate && p.status !== "Completed" && isAfter(parseISO(p.dueDate), today) && isBefore(parseISO(p.dueDate), subDays(today, -7))
    ).length;

    const departmentBreakdown = projects.reduce((acc, project) => {
      const dept = project.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = { total: 0, completed: 0 };
      acc[dept].total++;
      if (project.status === 'Completed') acc[dept].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const riskLevels = projects.reduce((acc, project) => {
      const risk = project.risk || 'Low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeMembers = Array.from(new Set(projects.filter(p => p.owner).map(p => p.owner))).length;

    const productivityTrend = Array.from({ length: 7 }, (_, i) => ({
      day: format(subDays(today, 6 - i), 'EEE'),
      completed: Math.floor(Math.random() * 10) + 5,
      created: Math.floor(Math.random() * 8) + 3
    }));

    return {
      overdueTasks,
      dueThisWeek,
      departmentBreakdown,
      riskLevels,
      activeMembers,
      productivityTrend,
      avgCompletionRate: Math.round((metrics.completed / metrics.totalTasks) * 100) || 0
    };
  }, [projects, metrics]);
}
