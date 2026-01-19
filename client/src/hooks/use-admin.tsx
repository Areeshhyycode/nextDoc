import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'sub-admin';
  profilePicture?: string;
  isOnline: boolean;
  lastActivity: string;
  lastLogin: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface LoginStats {
  userId: string;
  displayName: string;
  email: string;
  lastLogin: Date;
  loginCount: number;
}

export function useOnlineUsers() {
  return useQuery<User[]>({
    queryKey: ['/api/admin/users/online'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });
}

export function useAllUsers() {
  return useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });
}

export function useActivityLogs(options?: { userId?: string; action?: string; limit?: number; offset?: number }) {
  return useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity-logs', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.userId) params.append('userId', options.userId);
      if (options?.action) params.append('action', options.action);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      
      const response = await apiRequest('GET', `/api/admin/activity-logs?${params.toString()}`);
      return response.json();
    },
  });
}

export function useLoginStats() {
  return useQuery<LoginStats[]>({
    queryKey: ['/api/admin/login-stats'],
  });
}

export function useUpdateUserRole() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' | 'sub-admin' }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/online'] });
      toast({
        title: "Role Updated",
        description: `${updatedUser.displayName}'s role has been updated to ${updatedUser.role}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Role Update Failed",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });
}