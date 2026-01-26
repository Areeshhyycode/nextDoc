import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}

export function MenuButton({ onClick, active, children, title }: MenuButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-7 w-7 p-0",
        active && "bg-gray-200 dark:bg-gray-700"
      )}
    >
      {children}
    </Button>
  );
}
