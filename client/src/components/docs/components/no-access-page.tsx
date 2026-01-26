import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoAccessPageProps {
  onNavigateBack: () => void;
}

export function NoAccessPage({ onNavigateBack }: NoAccessPageProps) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to view this document. Please contact the document owner to request access.
        </p>
        <Button onClick={onNavigateBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
      </div>
    </div>
  );
}
