import { useOnlineUsers } from "@/hooks/use-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function OnlineUsers() {
  const { data: onlineUsers, isLoading, error } = useOnlineUsers();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Online Users
          </CardTitle>
          <CardDescription>Loading online users...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Online Users
          </CardTitle>
          <CardDescription className="text-red-500">Failed to load online users</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Online Users ({onlineUsers?.length || 0})
        </CardTitle>
        <CardDescription>Team members currently active in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {!onlineUsers || onlineUsers.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No users are currently online</p>
          </div>
        ) : (
          <div className="space-y-4">
            {onlineUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center space-x-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                data-testid={`online-user-${user.id}`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user.profilePicture} 
                      alt={user.displayName}
                    />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate" data-testid={`user-name-${user.id}`}>
                      {user.displayName}
                    </p>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : user.role === 'sub-admin' ? 'secondary' : 'outline'}
                      className="text-xs"
                      data-testid={`user-role-${user.id}`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate" data-testid={`user-email-${user.id}`}>
                    {user.email}
                  </p>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p data-testid={`user-activity-${user.id}`}>
                    Active {formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}