import { cn } from "@/lib/utils";

type ColorTheme = "teal" | "blue" | "red" | "green";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  theme?: ColorTheme;
  className?: string;
}

const themeConfig: Record<ColorTheme, {
  background: string;
  blob1: string;
  blob2: string;
}> = {
  teal: {
    background: "from-teal-50 via-emerald-50 to-cyan-50 dark:from-[#0a0f18] dark:via-[#0d1117] dark:to-[#0a0f18]",
    blob1: "from-teal-400/20 to-emerald-600/20",
    blob2: "from-emerald-400/20 to-cyan-600/20",
  },
  blue: {
    background: "from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900",
    blob1: "from-blue-400/20 to-purple-600/20",
    blob2: "from-indigo-400/20 to-cyan-600/20",
  },
  red: {
    background: "from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900",
    blob1: "from-red-400/20 to-orange-600/20",
    blob2: "from-orange-400/20 to-yellow-600/20",
  },
  green: {
    background: "from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900",
    blob1: "from-green-400/20 to-emerald-600/20",
    blob2: "from-teal-400/20 to-cyan-600/20",
  },
};

/**
 * Full page layout for auth pages with animated gradient background
 * Used in login, access-denied, and similar pages
 */
export function AuthPageLayout({ children, theme = "teal", className }: AuthPageLayoutProps) {
  const colors = themeConfig[theme];

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br p-4",
      colors.background,
      className
    )}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br rounded-full blur-3xl animate-pulse",
          colors.blob1
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr rounded-full blur-3xl animate-pulse delay-1000",
          colors.blob2
        )} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
