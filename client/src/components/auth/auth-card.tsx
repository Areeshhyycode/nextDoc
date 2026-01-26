import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  titleClassName?: string;
  className?: string;
}

/**
 * Glass morphism card for auth pages
 * Includes optional icon, title, and subtitle in header
 */
export function AuthCard({
  children,
  icon,
  title,
  subtitle,
  titleClassName,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn(
      "backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl",
      className
    )}>
      <CardHeader className="text-center pb-2">
        {icon && (
          <div className="mx-auto mb-4">
            {icon}
          </div>
        )}
        <CardTitle className={cn(
          "text-2xl font-bold",
          titleClassName
        )}>
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
