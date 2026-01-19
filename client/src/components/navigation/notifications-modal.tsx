import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Placeholder for future notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationsModal() {
  const [notifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleReadAll = () => {
    // Future: API call to mark all notifications as read
    console.log("Mark all as read");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {unreadNotifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" data-testid="notification-badge" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[400px] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
        data-testid="notifications-popover"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Header with Tabs and Read All button */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                data-testid="tab-all"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                data-testid="tab-unread"
              >
                Unread
              </TabsTrigger>
            </TabsList>
            
            <Button 
              size="sm" 
              variant="default"
              onClick={handleReadAll}
              disabled={unreadNotifications.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              data-testid="button-read-all"
            >
              Read all
            </Button>
          </div>

          {/* Content */}
          <TabsContent value="all" className="mt-0">
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic" data-testid="text-no-notifications">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
                        !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                      )}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic" data-testid="text-no-unread">
                    No unread notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-950/20"
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
