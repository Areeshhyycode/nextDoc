import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  completionPercentage: number;
  onSearch: (query: string) => void;
}

export function Header({ completionPercentage, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between" data-testid="header">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-header-title">
          Project Overview
        </h2>
        <Badge 
          variant="secondary" 
          className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
          data-testid="badge-completion-percentage"
        >
          {completionPercentage}% Complete
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64 pl-10"
            data-testid="input-header-search"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        <Avatar data-testid="avatar-user">
          <AvatarFallback className="bg-primary-600 text-white">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
