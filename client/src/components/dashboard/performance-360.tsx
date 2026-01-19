import React from "react";
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
  ArrowDownRight,
  Eye,
  BarChart3,
  PieChart,
  Award,
  Shield
} from "lucide-react";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import type { Project } from "@shared/schema";

interface Performance360Props {
  projects: Project[];
  metrics?: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    reviewing: number;
    completionPercentage: number;
  };
}

export function Performance360({ projects, metrics }: Performance360Props) {
  // Comprehensive analytics calculations
  const calculateComprehensiveMetrics = () => {
    if (!projects || projects.length === 0) return null;

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);

    // Department performance breakdown
    const departmentStats = projects.reduce((acc, project) => {
      const dept = project.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          blocked: 0,
          overdue: 0,
          highRisk: 0
        };
      }
      
      acc[dept].total++;
      
      switch (project.status) {
        case 'Completed':
          acc[dept].completed++;
          break;
        case 'In Progress':
        case 'Reviewing':
          acc[dept].inProgress++;
          break;
        case 'Blocked':
          acc[dept].blocked++;
          break;
      }

      // Check overdue
      if (project.dueDate && project.status !== 'Completed' && isBefore(parseISO(project.dueDate), today)) {
        acc[dept].overdue++;
      }

      // Check high risk
      if (project.risk === 'High') {
        acc[dept].highRisk++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Team performance
    const teamStats = projects.reduce((acc, project) => {
      const owner = project.owner || 'Unassigned';
      if (!acc[owner]) {
        acc[owner] = {
          total: 0,
          completed: 0,
          productivity: 0,
          departments: new Set()
        };
      }
      
      acc[owner].total++;
      acc[owner].departments.add(project.department);
      
      if (project.status === 'Completed') {
        acc[owner].completed++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate productivity scores
    Object.keys(teamStats).forEach(owner => {
      const stats = teamStats[owner];
      stats.productivity = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      stats.departmentCount = stats.departments.size;
    });

    // Risk distribution
    const riskDistribution = projects.reduce((acc, project) => {
      const risk = project.risk || 'Low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Stage analysis
    const stageDistribution = projects.reduce((acc, project) => {
      const stage = project.stage || 'Others';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Time-based trends (last 30 days)
    const trends = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const dayProjects = projects.filter(p => 
        p.dueDate && parseISO(p.dueDate).toDateString() === date.toDateString()
      );
      
      return {
        date: format(date, 'MMM dd'),
        completed: dayProjects.filter(p => p.status === 'Completed').length,
        total: dayProjects.length,
        productivity: dayProjects.length > 0 ? (dayProjects.filter(p => p.status === 'Completed').length / dayProjects.length) * 100 : 0
      };
    });

    return {
      departmentStats,
      teamStats,
      riskDistribution,
      stageDistribution,
      trends,
      totalMembers: Object.keys(teamStats).length,
      avgProductivity: Object.values(teamStats).reduce((sum: number, stats: any) => sum + stats.productivity, 0) / Object.keys(teamStats).length || 0
    };
  };

  const comprehensiveData = calculateComprehensiveMetrics();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (!comprehensiveData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            360° Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available for comprehensive analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Eye className="h-6 w-6 text-blue-600" />
            360° Performance Overview
          </CardTitle>
          <CardDescription className="text-lg">
            Comprehensive organizational performance insights across all departments and teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{Object.keys(comprehensiveData.departmentStats).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{comprehensiveData.totalMembers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round(comprehensiveData.avgProductivity)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Productivity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{projects?.length || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Department Performance */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Department Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(comprehensiveData.departmentStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([dept, stats]: [string, any]) => {
                    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                    return (
                      <div key={dept} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{dept}</h4>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{stats.total} total</Badge>
                            <Badge variant="outline" className="text-green-600">{stats.completed} done</Badge>
                          </div>
                        </div>
                        <Progress value={completionRate} className="h-3" />
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{stats.inProgress}</div>
                            <div className="text-gray-500">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{stats.blocked}</div>
                            <div className="text-gray-500">Blocked</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{stats.overdue}</div>
                            <div className="text-gray-500">Overdue</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{stats.highRisk}</div>
                            <div className="text-gray-500">High Risk</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(comprehensiveData.departmentStats).map(([dept, stats]: [string, any], index) => ({
                          name: dept,
                          value: stats.total,
                          fill: colors[index % colors.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      />
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Performance */}
        <TabsContent value="teams" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(comprehensiveData.teamStats)
                  .sort((a, b) => b[1].productivity - a[1].productivity)
                  .slice(0, 10)
                  .map(([member, stats]: [string, any], index) => (
                    <div key={member} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{member}</div>
                          <div className="text-sm text-gray-500">{stats.departmentCount} departments</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">{stats.productivity}%</div>
                        <div className="text-sm text-gray-500">{stats.completed}/{stats.total} completed</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(comprehensiveData.riskDistribution).map(([risk, count]) => ({ risk, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="risk" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Stage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(comprehensiveData.stageDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <span className="font-medium">{stage}</span>
                        <Badge variant="outline">{count} tasks</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                30-Day Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={comprehensiveData.trends}>
                    <defs>
                      <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="productivity"
                      stroke="#8b5cf6"
                      fill="url(#productivityGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}