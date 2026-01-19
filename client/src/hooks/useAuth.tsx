import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'sub-admin';
  profilePicture?: string;
  isOnline?: boolean;
  lastActivity?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (authData && !error) {
      setUser(authData as User);
    } else {
      setUser(null);
    }
  }, [authData, error]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      setUser(null);
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      queryClient.setQueryData(['/api/auth/user'], null);
      setUser(null);
      window.location.href = '/login';
    }
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}