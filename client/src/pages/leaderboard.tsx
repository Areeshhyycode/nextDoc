import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import {
  LeaderboardHeader,
  LeaderboardFilters,
  LeaderboardSummaryCards,
  PerformanceRankings,
  MonthlyProgressCharts
} from "@/components/leaderboard";
import { useLeaderboardStats, exportLeaderboardCSV } from "@/hooks/use-leaderboard-stats";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function LeaderboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [filterType, setFilterType] = useState<"month" | "custom">("month");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { ownerStats, monthlyProgressData } = useLeaderboardStats({
    projects,
    filterType,
    selectedMonth,
    dateRange
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <LeaderboardHeader onExport={() => exportLeaderboardCSV(ownerStats)} />

      <LeaderboardFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <LeaderboardSummaryCards stats={ownerStats} />

      <PerformanceRankings stats={ownerStats} />

      <MonthlyProgressCharts data={monthlyProgressData} />
    </div>
  );
}
