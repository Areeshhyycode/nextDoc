import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/navigation/sidebar";
import DocsPage from "@/pages/docs";
import DocEditorPage from "@/pages/doc-editor";
import TrashPage from "@/pages/trash";
import NotFound from "@/pages/not-found";
import PublicDocViewerPage from "@/pages/public-doc-viewer";
import LoginPage from "@/pages/login";

function AuthenticatedRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/80 dark:bg-[#0a0f18]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (location !== "/login") {
      setLocation("/login");
    }
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route>{() => { setLocation("/login"); return null; }}</Route>
      </Switch>
    );
  }

  // Redirect away from login if already authenticated
  if (location === "/login") {
    setLocation("/");
    return null;
  }

  return (
    <div className="h-screen bg-gray-50/80 dark:bg-[#0a0f18] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Switch>
            <Route path="/" component={DocsPage} />
            <Route path="/docs" component={DocsPage} />
            <Route path="/docs/my" component={DocsPage} />
            <Route path="/docs/meeting-notes" component={DocsPage} />
            <Route path="/docs/trash" component={TrashPage} />
            <Route path="/docs/:id" component={DocEditorPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function Router() {
  // Public routes - accessible without authentication
  const isPublicRoute = window.location.pathname.startsWith('/public/');
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/public/docs/:token" component={PublicDocViewerPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pmo-dashboard-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
