import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { AuthPageLayout, AuthCard } from "@/components/auth";

const AUTH_ROUTES = {
  google: '/auth/google',
  login: '/login',
} as const;

export default function AccessDenied() {
  return (
    <AuthPageLayout theme="red">
      <AuthCard
        icon={
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        }
        title="Access Denied"
        titleClassName="text-red-600 dark:text-red-400"
        subtitle="Only @cyberbay.tech email addresses are authorized"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
              This Project Management Dashboard is exclusively for Cyberbay team members.
              Please ensure you're signing in with your official @cyberbay.tech Google Workspace account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => window.location.href = AUTH_ROUTES.google}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              data-testid="button-try-again"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Try Again with @cyberbay.tech Account
            </Button>

            <Button
              onClick={() => window.location.href = AUTH_ROUTES.login}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 font-medium rounded-xl transition-all duration-200"
              data-testid="button-back-to-login"
            >
              Back to Login
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help? Contact your Cyberbay IT administrator
          </p>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
}
