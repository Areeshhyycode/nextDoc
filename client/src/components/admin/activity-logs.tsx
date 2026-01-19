import { useState } from "react";
import { useActivityLogs } from "@/hooks/use-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, User, LogIn, LogOut, Settings, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityLogs() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("");
  const [limit, setLimit] = useState(50);
  
  const { data: logs, isLoading, error, refetch } = useActivityLogs({
    action: actionFilter === "all" ? undefined : actionFilter,
    userId: userFilter || undefined,
    limit,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'role_change':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'logout':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
      case 'role_change':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDetails = (details: string | undefined) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return Object.entries(parsed).map(([key, value]) => (
        <span key={key} className="text-xs text-muted-foreground">
          {key}: {String(value)}
        </span>
      ));
    } catch {
      return <span className="text-xs text-muted-foreground">{details}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>Loading activity logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription className="text-red-500">Failed to load activity logs</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Logs ({logs?.length || 0})
            </CardTitle>
            <CardDescription>System activity and user actions</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            data-testid="button-refresh-logs"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger data-testid="select-action-filter">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Filter by user ID..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              data-testid="input-user-filter"
            />
          </div>
          <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
            <SelectTrigger className="w-24" data-testid="select-limit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          {!logs || logs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No activity logs found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  data-testid={`activity-log-${log.id}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.action)} data-testid={`log-action-${log.id}`}>
                        {log.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground" data-testid={`log-time-${log.id}`}>
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2" data-testid={`log-user-${log.id}`}>
                        <User className="h-3 w-3" />
                        User ID: {log.userId}
                      </p>
                      
                      {log.details && (
                        <div className="flex flex-wrap gap-2" data-testid={`log-details-${log.id}`}>
                          {formatDetails(log.details)}
                        </div>
                      )}
                      
                      {log.ipAddress && (
                        <p className="text-xs text-muted-foreground" data-testid={`log-ip-${log.id}`}>
                          IP: {log.ipAddress}
                        </p>
                      )}
                      
                      {log.userAgent && (
                        <p className="text-xs text-muted-foreground truncate" data-testid={`log-agent-${log.id}`}>
                          {log.userAgent}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-right">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}