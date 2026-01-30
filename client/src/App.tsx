import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopRightHeader } from "@/components/navigation/top-right-header";
import Dashboard from "@/pages/dashboard";
import ProductPage from "@/pages/product";
import DesignPage from "@/pages/design";
import DevPage from "@/pages/dev";
import MarketingPage from "@/pages/marketing";
import BugHuntingPage from "@/pages/bug-hunting";
import LeaderboardPage from "@/pages/leaderboard";
import { GoalsPage } from "@/pages/goals";
import { GoalDetailsPage } from "@/pages/goal-details";
import { CalendarPage } from "@/pages/calendar";
import { GoogleCalendarPage } from "@/pages/google-calendar";
import { SprintDetailsPage } from "@/pages/sprint-details";
import ProfileSettings from "@/pages/profile-settings";
import DocsPage from "@/pages/docs";
import DocEditorPage from "@/pages/doc-editor";
import ProjectsPage from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import AppsIntegrations from "@/pages/apps-integrations";
import Login from "@/pages/login";
import AccessDenied from "@/pages/access-denied";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import PublicDocViewerPage from "@/pages/public-doc-viewer";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import type { User } from "@shared/schema";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated
  });

  // Public routes - accessible without authentication
  // Check if current path is a public route
  const isPublicRoute = window.location.pathname.startsWith('/public/');
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/public/docs/:token" component={PublicDocViewerPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/access-denied" component={AccessDenied} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  // Show onboarding modal for new users
  const needsOnboarding = user && !user.hasCompletedOnboarding;

  // Show authenticated app with sidebar
  return (
    <>
      {needsOnboarding && (
        <OnboardingModal 
          open={true} 
          userName={user.displayName} 
        />
      )}
      
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/product" component={ProductPage} />
              <Route path="/design" component={DesignPage} />
              <Route path="/dev" component={DevPage} />
              <Route path="/marketing" component={MarketingPage} />
              <Route path="/bug-hunting" component={BugHuntingPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/goals" component={GoalsPage} />
              <Route path="/goals/:id" component={GoalDetailsPage} />
              <Route path="/calendar" component={CalendarPage} />
              <Route path="/google-calendar" component={GoogleCalendarPage} />
              <Route path="/sprints/:id" component={SprintDetailsPage} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/profile-settings" component={ProfileSettings} />
              <Route path="/docs" component={DocsPage} />
              <Route path="/docs/my" component={DocsPage} />
              <Route path="/docs/meeting-notes" component={DocsPage} />
              <Route path="/docs/:id" component={DocEditorPage} />
              <Route path="/projects" component={ProjectsPage} />
              <Route path="/projects/:id" component={ProjectDetail} />
              <Route path="/workspace-projects/:id" component={ProjectDetail} />
              <Route path="/apps-integrations" component={AppsIntegrations} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </>
  );
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
