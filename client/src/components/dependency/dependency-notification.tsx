import React from "react";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DependencyNotification {
  taskId: string;
  taskName: string;
  type: "unblocked" | "blocked" | "dependency_completed";
  message: string;
}

interface DependencyNotificationSystemProps {
  notifications: DependencyNotification[];
  onDismiss: (taskId: string) => void;
}

export function DependencyNotificationSystem({
  notifications,
  onDismiss
}: DependencyNotificationSystemProps) {
  const { toast } = useToast();

  React.useEffect(() => {
    notifications.forEach(notification => {
      const icon = notification.type === "unblocked" 
        ? <CheckCircle className="h-4 w-4" />
        : notification.type === "blocked"
        ? <AlertTriangle className="h-4 w-4" />
        : <Clock className="h-4 w-4" />;

      const variant = notification.type === "unblocked" 
        ? "default"
        : notification.type === "blocked"
        ? "destructive"
        : "default";

      toast({
        title: notification.type === "unblocked" 
          ? "Task Unblocked" 
          : notification.type === "blocked"
          ? "Task Blocked"
          : "Dependency Update",
        description: notification.message,
        variant,
        duration: 5000,
      });

      // Auto-dismiss notification after showing
      setTimeout(() => {
        onDismiss(notification.taskId);
      }, 5000);
    });
  }, [notifications, toast, onDismiss]);

  return null; // This component only manages toast notifications
}

// Utility function to create dependency notifications
export function createDependencyNotification(
  taskId: string,
  taskName: string,
  type: DependencyNotification["type"],
  dependencyName?: string
): DependencyNotification {
  let message = "";
  
  switch (type) {
    case "unblocked":
      message = `"${taskName}" is now unblocked and ready to start. All dependencies have been completed.`;
      break;
    case "blocked":
      message = `"${taskName}" has been blocked due to incomplete dependencies.`;
      break;
    case "dependency_completed":
      message = `Dependency "${dependencyName}" has been completed. This may unblock other tasks.`;
      break;
  }

  return {
    taskId,
    taskName,
    type,
    message
  };
}