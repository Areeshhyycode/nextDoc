import { Button } from "@/components/ui/button";
import { Views } from "react-big-calendar";

type ViewType = typeof Views[keyof typeof Views];

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const VIEW_OPTIONS = [
  { value: Views.MONTH, label: "Month" },
  { value: Views.WEEK, label: "Week" },
  { value: Views.DAY, label: "Day" },
] as const;

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {VIEW_OPTIONS.map(({ value, label }) => (
        <Button
          key={label}
          variant="outline"
          size="sm"
          onClick={() => onViewChange(value)}
          className={view === value ? "bg-blue-100 dark:bg-blue-900" : ""}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
