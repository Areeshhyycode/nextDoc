import { useAuth } from "@/hooks/useAuth";
import { OnlineUsers } from "@/components/admin/online-users";
import { ActivityLogs } from "@/components/admin/activity-logs";
import { AdminHeader } from "@/components/admin/admin-header";
import { LoginStatsCard } from "@/components/admin/login-stats-card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Activity } from "lucide-react";
import { useLoginStats, useAllUsers } from "@/hooks/use-admin";
import { Link } from "wouter";
import { StatsCard } from "@/components/ui/stats-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthPageLayout, AuthCard } from "@/components/auth";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: loginStats } = useLoginStats();
  const { data: allUsers } = useAllUsers();

  if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'sub-admin'))) {
    return (
      <AuthPageLayout theme="red">
        <AuthCard
          icon={<Shield className="h-16 w-16 text-red-500" />}
          title="Access Denied"
          titleClassName="text-red-600 dark:text-red-400"
          subtitle="Administrator privileges required to view this page."
        >
          <Button asChild className="w-full">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </AuthCard>
      </AuthPageLayout>
    );
  }

  if (authLoading || !user) return <LoadingSpinner fullScreen />;

  const totalUsers = allUsers?.length || 0;
  const adminUsers = allUsers?.filter(u => u.role === 'admin').length || 0;
  const onlineUsers = allUsers?.filter(u => u.isOnline).length || 0;

  const statsConfig = [
    { title: "Total Users", value: totalUsers, description: "Registered team members", icon: Users, color: "text-blue-600", testId: "stat-total-users" },
    { title: "Online Now", value: onlineUsers, description: "Currently active users", icon: Activity, color: "text-green-600", testId: "stat-online-users" },
    { title: "Administrators", value: adminUsers, description: "Admin & Sub-admin users", icon: Shield, color: "text-red-600", testId: "stat-admin-users" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader role={user.role} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsConfig.map(({ title, value, description, icon, color, testId }) => (
            <StatsCard key={testId} title={title} value={value} description={description} icon={icon} iconColor={color} valueColor={color} data-testid={testId} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div data-testid="online-users-section"><OnlineUsers /></div>
          <div data-testid="activity-logs-section"><ActivityLogs /></div>
        </div>

        {loginStats && <LoginStatsCard stats={loginStats} />}
      </div>
    </div>
  );
}
