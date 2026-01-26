import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { LoginStatItem } from "@/components/ui/login-stat-item";

interface LoginStat {
  userId: string;
  displayName: string;
  email: string;
  loginCount: number;
  lastLogin: Date;
}

interface LoginStatsCardProps {
  stats: LoginStat[];
  limit?: number;
}

export function LoginStatsCard({ stats, limit = 10 }: LoginStatsCardProps) {
  if (!stats || stats.length === 0) return null;

  return (
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
            {stats.slice(0, limit).map((stat) => (
              <LoginStatItem key={stat.userId} {...stat} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
