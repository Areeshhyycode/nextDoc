import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trophy, Medal, Award, Target, TrendingUp, TrendingDown, Calendar as CalendarIcon, Filter, Download, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, getMonth, getYear } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

interface OwnerStats {
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

  // Owner name consolidation mapping
  const consolidateOwnerName = (owner: string): string => {
    const normalizedOwner = owner.trim().toLowerCase();
    
    // Zara consolidation
    if (normalizedOwner.includes('zara.amirzade@cyberbay.tech') || 
        normalizedOwner === 'zara a' || 
        normalizedOwner === 'zara a.') {
      return 'Zara A';
    }
    
    // Shaharyar consolidation  
    if (normalizedOwner.includes('shaharyar') || 
        normalizedOwner === 'brett' ||
        normalizedOwner.includes('shaharyar.asgher@cyberbay.tech')) {
      return 'Shaharyar Asgher';
    }
    
    // Tom Austin consolidation
    if (normalizedOwner.includes('tom@cyberbay.tech') || 
        normalizedOwner === 'tom austin') {
      return 'Tom Austin';
    }
    
    // Quang consolidation
    if (normalizedOwner.includes('quang@cyberbay.tech') || 
        normalizedOwner.includes('quang (brett) ngo')) {
      return 'Quang (Brett) Ngo';
    }
    
    // Dillon consolidation
    if (normalizedOwner.includes('dillon.bong@cyberbay.tech') || 
        normalizedOwner === 'dillon bong') {
      return 'Dillon Bong';
    }
    
    // Thuy consolidation
    if (normalizedOwner.includes('thuy (sweet) phan thanh') || 
        normalizedOwner.includes('thuy.phanthithanh@cyberbay.tech')) {
      return 'Thuy (Sweet) Phan Thanh';
    }
    
    // Return original name with proper capitalization
    return owner.trim();
  };

  // Filter projects based on date selection
  const filteredProjects = projects.filter((project) => {
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

  // Calculate owner statistics
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
      
      // Status tracking
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

      // Department spread
      stats.departmentSpread[project.department] = (stats.departmentSpread[project.department] || 0) + 1;
      
      // Risk distribution
      if (project.risk) {
        stats.riskDistribution[project.risk] = (stats.riskDistribution[project.risk] || 0) + 1;
      }
      
      // Stage distribution
      if (project.stage) {
        stats.stageDistribution[project.stage] = (stats.stageDistribution[project.stage] || 0) + 1;
      }

      // Check for overdue tasks
      if (project.dueDate && project.status !== "Completed") {
        const dueDate = parseISO(project.dueDate);
        if (dueDate < new Date()) {
          stats.overdueCount++;
        }
      }

      // Recent activity (tasks updated in last 30 days)
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

  const ownerStats: OwnerStats[] = Object.values(ownerStatsMap)
    .map((stats: OwnerStats) => {
      // Calculate completion rate
      stats.completionRate = stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0;
      
      // Calculate productivity score (weighted metric)
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

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Generate monthly progress data
  const generateMonthlyProgress = () => {
    const monthlyData: Record<string, { completed: number; total: number; inProgress: number; blocked: number }> = {};
    
    filteredProjects.forEach(project => {
      // Use dueDate or current date for month grouping
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

    // Convert to array and sort by date
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
  };

  const monthlyProgressData = generateMonthlyProgress();

  const exportLeaderboard = () => {
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
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track team performance and productivity metrics</p>
        </div>
        <Button onClick={exportLeaderboard} variant="outline" className="gap-2" data-testid="button-export">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Date Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as "month" | "custom")}>
            <TabsList>
              <TabsTrigger value="month">Monthly View</TabsTrigger>
              <TabsTrigger value="custom">Custom Range</TabsTrigger>
            </TabsList>
            
            <TabsContent value="month" className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="month-select">Select Month:</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48" id="month-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="0">This Month</SelectItem>
                    <SelectItem value="1">Last Month</SelectItem>
                    <SelectItem value="2">2 Months Ago</SelectItem>
                    <SelectItem value="3">3 Months Ago</SelectItem>
                    <SelectItem value="6">6 Months Ago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>From:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-48 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label>To:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-48 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contributors</p>
                <p className="text-2xl font-bold">{ownerStats.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Completion Rate</p>
                <p className="text-2xl font-bold">
                  {ownerStats.length > 0 ? (ownerStats.reduce((sum, stats) => sum + stats.completionRate, 0) / ownerStats.length).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{ownerStats.reduce((sum, stats) => sum + stats.totalTasks, 0)}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600">{ownerStats.reduce((sum, stats) => sum + stats.overdueCount, 0)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Rankings</CardTitle>
          <CardDescription>
            Ranked by productivity score (completion rate, recent activity, and quality metrics)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ownerStats.map((stats, index) => (
              <div
                key={stats.owner}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border",
                  index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" : "bg-gray-50 dark:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {stats.owner}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{stats.totalTasks} tasks</span>
                      <span>•</span>
                      <span className={getPerformanceColor(stats.completionRate)}>
                        {stats.completionRate.toFixed(1)}% complete
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
                    <p className="text-xs text-gray-500">Not Started</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                    <p className="text-xs text-gray-500">Overdue</p>
                  </div>
                  
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Productivity</span>
                      <span className="font-medium">{stats.productivity.toFixed(0)}</span>
                    </div>
                    <Progress value={stats.productivity} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(stats.departmentSpread)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 2)
                      .map(([dept, count]) => (
                        <Badge key={dept} variant="secondary" className="text-xs">
                          {dept}: {count}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress Graph */}
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
              <BarChart data={monthlyProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'completed' ? 'Completed' :
                    name === 'inProgress' ? 'In Progress' :
                    name === 'blocked' ? 'Blocked' : 'Total'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  fill="#10b981" 
                  name="Completed"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="inProgress" 
                  fill="#3b82f6" 
                  name="In Progress"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="blocked" 
                  fill="#ef4444" 
                  name="Blocked"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Completion Rate Trend Line */}
          <div className="mt-6 h-60 w-full">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Completion Rate Trend
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
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

          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-400">Best Month</span>
              </div>
              <div className="mt-1">
                {monthlyProgressData.length > 0 && (
                  <>
                    <div className="text-lg font-bold text-green-900 dark:text-green-300">
                      {monthlyProgressData.reduce((best, current) => 
                        current.completionRate > best.completionRate ? current : best
                      ).month}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      {monthlyProgressData.reduce((best, current) => 
                        current.completionRate > best.completionRate ? current : best
                      ).completionRate}% completion rate
                    </div>
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
                <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  {monthlyProgressData.reduce((sum, month) => sum + month.total, 0)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  Across all months
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-400">Avg Completion</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold text-purple-900 dark:text-purple-300">
                  {monthlyProgressData.length > 0 
                    ? Math.round(monthlyProgressData.reduce((sum, month) => sum + month.completionRate, 0) / monthlyProgressData.length)
                    : 0}%
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-400">
                  Overall average
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}