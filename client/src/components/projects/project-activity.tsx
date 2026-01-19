import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Filter, Sparkles, CheckCircle2, Circle, UserPlus, UserMinus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectActivity } from "@shared/schema";

interface ProjectActivityProps {
  projectId: string;
}

interface ActivityWithUser extends ProjectActivity {
  user?: {
    displayName: string;
    firstName?: string;
    lastName?: string;
  };
}

export function ProjectActivityFeed({ projectId }: ProjectActivityProps) {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/project-activities", projectId],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Merge users with activities
  const activitiesWithUsers = activities.map((activity) => ({
    ...activity,
    user: users.find((u) => u.id === activity.userId),
  }));

  // Group activities by date
  const groupedActivities = activitiesWithUsers.reduce((groups, activity) => {
    const date = parseISO(activity.createdAt as unknown as string);
    let dateKey: string;

    if (isToday(date)) {
      dateKey = "Today";
    } else if (isYesterday(date)) {
      dateKey = "Yesterday";
    } else {
      dateKey = format(date, "MMM d");
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, ActivityWithUser[]>);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_changed":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "task_added":
        return <Circle className="h-4 w-4 text-gray-500" />;
      case "member_added":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case "member_removed":
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case "description_updated":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityWithUser) => {
    const userName = activity.user?.displayName || "Someone";
    const entityName = activity.entityName || "";

    switch (activity.activityType) {
      case "status_changed":
        return (
          <>
            <span className="font-normal">{userName} changed the status of </span>
            <span className="font-medium">📁 {entityName}</span>
            <span className="font-normal"> to </span>
            <span className="font-semibold">{activity.newValue}</span>
          </>
        );
      case "task_completed":
        return (
          <>
            <span className="font-normal">{userName} completed </span>
            <span className="font-semibold">{entityName}</span>
          </>
        );
      case "task_added":
        return (
          <>
            <span className="font-normal">{userName} added </span>
            <span className="font-semibold">{entityName}</span>
          </>
        );
      case "task_updated":
        return (
          <>
            <span className="font-normal">{userName} updated </span>
            <span className="font-semibold">{entityName}</span>
          </>
        );
      case "member_added":
        return (
          <>
            <span className="font-normal">{userName} added </span>
            <span className="font-semibold">{entityName}</span>
            <span className="font-normal"> to the project</span>
          </>
        );
      case "description_updated":
        return (
          <>
            <span className="font-normal">{userName} updated the project description</span>
          </>
        );
      default:
        return <span className="font-normal">{userName} performed an action</span>;
    }
  };

  const getUserInitials = (activity: ActivityWithUser) => {
    if (activity.user?.firstName && activity.user?.lastName) {
      return `${activity.user.firstName[0]}${activity.user.lastName[0]}`.toUpperCase();
    }
    if (activity.user?.displayName) {
      const parts = activity.user.displayName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return activity.user.displayName.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-normal text-gray-900 dark:text-white">Project activity</h3>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" data-testid="button-filter-activity">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading activities...</div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-normal text-gray-900 dark:text-white">Project activity</h3>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" data-testid="button-filter-activity">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">No updates yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-normal text-gray-900 dark:text-white">Project activity</h3>
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400" data-testid="button-filter-activity">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
          <div key={dateKey} className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{dateKey}</div>
            <div className="space-y-2">
              {dateActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  data-testid={`activity-${activity.id}`}
                >
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
                      {getUserInitials(activity)}
                    </div>
                  </div>

                  {/* Activity Icon & Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getActivityIcon(activity.activityType)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{getActivityText(activity)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {format(parseISO(activity.createdAt as unknown as string), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
