import { AlertCircle } from "lucide-react";

interface InfoBannerProps {
  message: React.ReactNode;
  learnMoreUrl?: string;
}

export function InfoBanner({ message, learnMoreUrl }: InfoBannerProps) {
  return (
    <div className="mx-8 mb-6">
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {message}
          {learnMoreUrl && (
            <>
              {" "}
              <a href={learnMoreUrl} className="text-gray-900 dark:text-white underline hover:no-underline">
                Learn more
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
