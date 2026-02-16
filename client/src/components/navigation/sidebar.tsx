import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Files,
  Notebook,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location, isMobile]);

  const expanded = isMobile ? mobileOpen : isHovered;

  const navItems = [
    { href: "/docs", match: (loc: string) => loc === "/docs" || loc === "/", icon: Files, label: "All Docs", color: "teal" },
    { href: "/docs/my", match: (loc: string) => loc === "/docs/my", icon: FileText, label: "Created by me", color: "emerald" },
    { href: "/docs/meeting-notes", match: (loc: string) => loc === "/docs/meeting-notes", icon: Notebook, label: "Meeting Notes", color: "amber" },
    { href: "/docs/trash", match: (loc: string) => loc === "/docs/trash", icon: Trash2, label: "Trash", color: "rose" },
  ];

  const colorMap: Record<string, { active: string; indicator: string; icon: string }> = {
    teal: { active: "bg-teal-50 dark:bg-teal-500/10", indicator: "bg-teal-500", icon: "text-teal-600 dark:text-teal-400" },
    emerald: { active: "bg-emerald-50 dark:bg-emerald-500/10", indicator: "bg-emerald-500", icon: "text-emerald-600 dark:text-emerald-400" },
    amber: { active: "bg-amber-50 dark:bg-amber-500/10", indicator: "bg-amber-500", icon: "text-amber-600 dark:text-amber-400" },
    rose: { active: "bg-rose-50 dark:bg-rose-500/10", indicator: "bg-rose-500", icon: "text-rose-500 dark:text-rose-400" },
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "bg-white dark:bg-[#0d1117] border-r border-gray-200/80 dark:border-gray-800/60 flex flex-col h-screen transition-all duration-300 ease-in-out",
          isMobile
            ? cn("z-40 flex-shrink-0", mobileOpen ? "w-56" : "w-[52px]")
            : expanded ? "w-56" : "w-[68px]"
        )}
        onMouseEnter={() => { if (!isMobile) setIsHovered(true); }}
        onMouseLeave={() => { if (!isMobile) setIsHovered(false); }}
      >
        {/* Brand */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800/60">
          <div className={cn("flex items-center gap-3 p-2", expanded ? "justify-start" : "justify-center")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {expanded && (
              <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">
                NextDocs
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {/* Section header */}
          <button
            onClick={() => {
              if (isMobile && !mobileOpen) { setMobileOpen(true); return; }
              setDocsExpanded(!docsExpanded);
            }}
            className={cn(
              "w-full flex items-center gap-3 transition-all group",
              expanded
                ? "px-5 h-9 mb-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg mx-1"
                : "px-0 h-9 mb-1 justify-center hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
          >
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
            {expanded && (
              <>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-1 text-left uppercase tracking-widest">
                  Docs
                </span>
                {docsExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                )}
              </>
            )}
          </button>

          {/* Nav items */}
          {docsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {navItems.map((item) => {
                const isActive = item.match(location);
                const colors = colorMap[item.color];
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 transition-all relative group",
                        isActive && colors.active,
                        !isActive && "hover:bg-gray-50 dark:hover:bg-gray-800/40",
                        expanded ? "pl-10 pr-4 py-2" : "px-0 py-2 justify-center"
                      )}
                    >
                      <Icon className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        isActive ? colors.icon : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      )} />
                      {expanded && (
                        <span className={cn(
                          "text-[13px] font-medium whitespace-nowrap transition-colors",
                          isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                        )}>
                          {item.label}
                        </span>
                      )}
                      {isActive && (
                        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full", colors.indicator)} />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom brand */}
        {expanded && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Ready</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
