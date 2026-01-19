import { useQuery } from "@tanstack/react-query";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { Performance360 } from "@/components/dashboard/performance-360";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Activity,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ['/api/metrics'],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Calculate advanced metrics
  const calculateAdvancedMetrics = () => {
    if (!projects || !metrics) return null;

    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const thirtyDaysAgo = subDays(today, 30);

    // Overdue tasks
    const overdueTasks = projects.filter(p => 
      p.dueDate && 
      p.status !== "Completed" && 
      isBefore(parseISO(p.dueDate), today)
    ).length;

    // Due this week
    const dueThisWeek = projects.filter(p => 
      p.dueDate && 
      p.status !== "Completed" && 
      isAfter(parseISO(p.dueDate), today) &&
      isBefore(parseISO(p.dueDate), subDays(today, -7))
    ).length;

    // Department breakdown
    const departmentBreakdown = projects.reduce((acc, project) => {
      const dept = project.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = { total: 0, completed: 0 };
      acc[dept].total++;
      if (project.status === 'Completed') acc[dept].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Risk analysis
    const riskLevels = projects.reduce((acc, project) => {
      const risk = project.risk || 'Low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Active team members
    const activeMembers = Array.from(new Set(projects.filter(p => p.owner).map(p => p.owner))).length;

    // Productivity trends (mock 7-day data for visualization)
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
      avgCompletionRate: Math.round((metrics.completed / metrics.totalTasks) * 100)
    };
  };

  const advancedMetrics = calculateAdvancedMetrics();

  const riskColors = ['#ef4444', '#f59e0b', '#10b981', '#6b7280'];

  if (metricsLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Modern Hero Header */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          
          <Card className="relative border-0 shadow-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
            <CardContent className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live Dashboard
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                    Cyberbay PMO
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                    Comprehensive project management dashboard driving operational excellence across all departments
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 lg:gap-8">
                  <div className="text-center group/stat">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-20 group-hover/stat:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                        <div className="text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                          {advancedMetrics?.avgCompletionRate || 0}%
                        </div>
                        <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center group/stat">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-20 group-hover/stat:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                        <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {advancedMetrics?.activeMembers || 0}
                        </div>
                        <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
                          Active Teams
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center group/stat">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl opacity-20 group-hover/stat:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                        <div className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                          {advancedMetrics?.overdueTasks || 0}
                        </div>
                        <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
                          Urgent Tasks
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Metrics Overview */}
        <MetricsCards metrics={metrics} isLoading={metricsLoading} />

        {/* Modern Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Priority Alerts with modern design */}
          <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-red-50/80 via-orange-50/80 to-pink-50/80 dark:from-red-950/50 dark:via-orange-950/50 dark:to-pink-950/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                </div>
                Priority Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="group/item flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Overdue Tasks</span>
                </div>
                <Badge variant="destructive" className="px-3 py-1 text-sm font-bold">
                  {advancedMetrics?.overdueTasks || 0}
                </Badge>
              </div>
              
              <div className="group/item flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Due This Week</span>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm font-bold border-yellow-300 text-yellow-700 dark:text-yellow-400">
                  {advancedMetrics?.dueThisWeek || 0}
                </Badge>
              </div>

              <div className="group/item flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Blocked Tasks</span>
                </div>
                <Badge variant="destructive" className="px-3 py-1 text-sm font-bold">
                  {metrics?.blocked || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Department Performance with enhanced styling */}
          <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {advancedMetrics && Object.entries(advancedMetrics.departmentBreakdown)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 4)
                .map(([dept, data]) => {
                  const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
                  return (
                    <div key={dept} className="group/dept space-y-3 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {dept}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(completionRate)}%
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {data.completed}/{data.total}
                          </span>
                        </div>
                      </div>
                      <Progress value={completionRate} className="h-3 bg-gray-200 dark:bg-gray-700" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Risk Analysis with modern chart */}
          <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={advancedMetrics ? Object.entries(advancedMetrics.riskLevels).map(([risk, count]) => ({ 
                        name: risk || 'Low', 
                        value: count 
                      })) : []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {advancedMetrics && Object.entries(advancedMetrics.riskLevels).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={riskColors[index % riskColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Productivity Trends */}
        <Card className="group relative border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Productivity Analytics
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    7-day performance insights with completion trends
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={advancedMetrics?.productivityTrend || []}>
                  <defs>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#completedGradient)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="url(#createdGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 360° Performance Overview */}
        <Performance360 
          projects={projects}
          metrics={metrics}
        />

        {/* Original Charts Section */}
        <ChartsSection 
          metrics={metrics} 
          projects={projects}
          isLoading={metricsLoading || projectsLoading} 
        />
      </div>
    </div>
  );
}
