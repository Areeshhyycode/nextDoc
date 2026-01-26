import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3 } from "lucide-react";
import { Link } from "wouter";

interface AdminHeaderProps {
  role: string;
}

export function AdminHeader({ role }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3" data-testid="admin-title">
          <Shield className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          System administration and user management
        </p>
        <Badge
          variant={role === 'admin' ? 'destructive' : 'secondary'}
          className="mt-2"
          data-testid="admin-role-badge"
        >
          {role.toUpperCase()}
        </Badge>
      </div>
      <Button asChild variant="outline">
        <Link href="/" data-testid="link-main-dashboard">
          <BarChart3 className="h-4 w-4 mr-2" />
          Main Dashboard
        </Link>
      </Button>
    </div>
  );
}
