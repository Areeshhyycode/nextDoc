import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

/**
 * User avatar with initials and gradient background
 * Extracts first letter(s) from name and displays with consistent styling
 */
export function UserAvatar({ name, size = "sm", className }: UserAvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
