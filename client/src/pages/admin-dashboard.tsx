import { useAuth } from "@/hooks/useAuth";
import { OnlineUsers } from "@/components/admin/online-users";
import { ActivityLogs } from "@/components/admin/activity-logs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Activity, BarChart3, Settings } from "lucide-react";
import { useLoginStats, useAllUsers } from "@/hooks/use-admin";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: loginStats } = useLoginStats();
  const { data: allUsers } = useAllUsers();

  // Redirect if not admin
  if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'sub-admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">Access Denied</CardTitle>
            <CardDescription>Administrator privileges required to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalUsers = allUsers?.length || 0;
  const adminUsers = allUsers?.filter(u => u.role === 'admin').length || 0;
  const onlineUsers = allUsers?.filter(u => u.isOnline).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3" data-testid="admin-title">
                <Shield className="h-8 w-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                System administration and user management
              </p>
              <Badge 
                variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                className="mt-2"
                data-testid="admin-role-badge"
              >
                {user.role.toUpperCase()}
              </Badge>
            </div>
            <Button asChild variant="outline">
              <Link href="/" data-testid="link-main-dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Main Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" data-testid="stat-total-users">
                <Users className="h-5 w-5 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalUsers}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Registered team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" data-testid="stat-online-users">
                <Activity className="h-5 w-5 text-green-600" />
                Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{onlineUsers}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Currently active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2" data-testid="stat-admin-users">
                <Shield className="h-5 w-5 text-red-600" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{adminUsers}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Admin & Sub-admin users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Users */}
          <div data-testid="online-users-section">
            <OnlineUsers />
          </div>

          {/* Activity Logs */}
          <div data-testid="activity-logs-section">
            <ActivityLogs />
          </div>
        </div>

        {/* Login Stats */}
        {loginStats && loginStats.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Login Statistics
                </CardTitle>
                <CardDescription>User login activity and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loginStats.slice(0, 10).map((stat) => (
                    <div 
                      key={stat.userId}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      data-testid={`login-stat-${stat.userId}`}
                    >
                      <div>
                        <p className="font-medium">{stat.displayName}</p>
                        <p className="text-sm text-muted-foreground">{stat.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stat.loginCount} logins</p>
                        <p className="text-sm text-muted-foreground">
                          Last: {new Date(stat.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}