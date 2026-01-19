import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Package, 
  Palette, 
  Code, 
  Megaphone, 
  AlertTriangle, 
  Ban, 
  Eye,
  LayoutDashboard
} from "lucide-react";

interface SidebarProps {
  metrics: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    reviewing: number;
    overdue: number;
    temporaryHold: number;
    completionPercentage: number;
  };
  onFilterChange: (filter: { department?: string; status?: string }) => void;
}

export function Sidebar({ metrics, onFilterChange }: SidebarProps) {
  const [location] = useLocation();

  const departments = [
    { 
      id: "product", 
      name: "Product", 
      icon: Package, 
      color: "text-blue-500", 
      count: 24,
      testId: "link-department-product"
    },
    { 
      id: "design", 
      name: "Design", 
      icon: Palette, 
      color: "text-purple-500", 
      count: 18,
      testId: "link-department-design"
    },
    { 
      id: "dev", 
      name: "Development", 
      icon: Code, 
      color: "text-green-500", 
      count: 32,
      testId: "link-department-dev"
    },
    { 
      id: "marketing", 
      name: "Marketing & Sales", 
      icon: Megaphone, 
      color: "text-orange-500", 
      count: 36,
      testId: "link-department-marketing"
    },
  ];

  const quickFilters = [
    { 
      id: "overdue", 
      name: "Overdue", 
      icon: AlertTriangle, 
      color: "text-red-500", 
      count: metrics.overdue,
      badgeClass: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      testId: "link-filter-overdue"
    },
    { 
      id: "blocked", 
      name: "Blocked", 
      icon: Ban, 
      color: "text-gray-500", 
      count: metrics.blocked,
      badgeClass: "bg-gray-100 dark:bg-gray-700",
      testId: "link-filter-blocked"
    },
    { 
      id: "reviewing", 
      name: "Reviewing", 
      icon: Eye, 
      color: "text-yellow-500", 
      count: metrics.reviewing,
      badgeClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      testId: "link-filter-reviewing"
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0" data-testid="sidebar">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-sidebar-title">
            PMO Dashboard
          </h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        <Link href="/">
          <span className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            location === "/" 
              ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`} data-testid="link-dashboard">
            <Home size={16} />
            <span>Dashboard</span>
          </span>
        </Link>
        
        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Departments
          </h3>
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.id}
                onClick={() => onFilterChange({ department: dept.id })}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                data-testid={dept.testId}
              >
                <Icon size={16} className={dept.color} />
                <span>{dept.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {dept.count}
                </Badge>
              </button>
            );
          })}
        </div>
        
        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Quick Filters
          </h3>
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange({ status: filter.id })}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                data-testid={filter.testId}
              >
                <Icon size={16} className={filter.color} />
                <span>{filter.name}</span>
                <Badge variant="secondary" className={`ml-auto text-xs px-2 py-1 rounded-full ${filter.badgeClass}`}>
                  {filter.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
