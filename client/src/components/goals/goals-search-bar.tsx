import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GoalsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function GoalsSearchBar({ value, onChange }: GoalsSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 sm:h-4 sm:w-4" />
        <Input
          placeholder="Search goals by title, description, or owner..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 sm:pl-10 h-12 sm:h-10 text-[15px] sm:text-sm"
          data-testid="search-goals"
        />
      </div>
    </div>
  );
}
