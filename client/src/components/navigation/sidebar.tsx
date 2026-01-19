import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Palette, 
  Code, 
  Megaphone,
  Shield,
  BarChart3,
  Target,
  Calendar,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  UsersRound,
  FileText,
  Files,
  Notebook,
  Folder,
  MoreVertical,
  ExternalLink,
  Trash2,
  Puzzle,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { InviteModal } from "@/components/admin/invite-modal";
import { CreateTeamModal } from "@/components/teams/create-team-modal";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Team, WorkspaceProject } from "@shared/schema";

// Icon mapping for dynamic rendering
const iconMap: Record<string, any> = {
  Users,
  Package,
  Palette,
  Code,
  Megaphone,
  Shield,
  Target,
  Calendar,
  BarChart3,
};

// Non-team navigation items
// Section-based navigation structure
const navigationSections = [
  {
    label: "Planning & Strategy",
    items: [
      { 
        id: "dashboard", 
        name: "Dashboard", 
        path: "/", 
        icon: LayoutDashboard,
        color: "text-blue-600 dark:text-blue-400"
      },
      { 
        id: "goals", 
        name: "Goals & OKRs", 
        path: "/goals", 
        icon: Target,
        color: "text-indigo-600 dark:text-indigo-400"
      },
    ]
  },
  {
    label: "Schedule",
    items: [
      { 
        id: "calendar", 
        name: "Calendar", 
        path: "/calendar", 
        icon: Calendar,
        color: "text-green-600 dark:text-green-400"
      },
      { 
        id: "google-calendar", 
        name: "Google Calendar", 
        path: "/google-calendar", 
        icon: Calendar,
        color: "text-orange-600 dark:text-orange-400"
      },
    ]
  },
  {
    label: "Reporting & Apps",
    items: [
      { 
        id: "leaderboard", 
        name: "Reports", 
        path: "/leaderboard", 
        icon: BarChart3,
        color: "text-purple-600 dark:text-purple-400"
      },
      { 
        id: "apps-integrations", 
        name: "Apps & Integrations", 
        path: "/apps-integrations", 
        icon: Puzzle,
        color: "text-teal-600 dark:text-teal-400"
      },
    ]
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Workspace popover state
  const [isWorkspacePopoverOpen, setIsWorkspacePopoverOpen] = useState(false);
  const [isWorkspaceLockedOpen, setIsWorkspaceLockedOpen] = useState(false);
  const [isWorkspaceInteracting, setIsWorkspaceInteracting] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const workspaceButtonRef = useRef<HTMLButtonElement>(null);
  const workspacePopoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousIsHoveredRef = useRef(isHovered);

  // Fetch teams from backend
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch workspace projects from backend
  const { data: workspaceProjects = [] } = useQuery<WorkspaceProject[]>({
    queryKey: ["/api/workspace-projects"],
  });

  // Fetch all users for member count
  const { data: allUsers = [] } = useQuery<{ id: string; displayName: string; email: string }[]>({
    queryKey: ["/api/users"],
  });

  // Get workspace name from user's onboarding data or use default
  const workspaceName = (user as any)?.onboardingWorkspaceName || "My Workspace";
  const workspaceInitial = workspaceName.charAt(0).toUpperCase();
  const memberCount = allUsers.length;

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await apiRequest("DELETE", `/api/workspace-projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace-projects"] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleOpenInNewTab = (projectId: string) => {
    window.open(`/projects/${projectId}`, '_blank');
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  // Workspace popover positioning
  const updatePopoverPosition = useCallback(() => {
    if (!workspaceButtonRef.current) return;
    
    const rect = workspaceButtonRef.current.getBoundingClientRect();
    const gap = 12;
    
    setPopoverPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + gap,
    });
  }, []);

  // Workspace popover hover logic
  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const startCloseTimer = useCallback(() => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!isWorkspaceLockedOpen) {
        setIsWorkspacePopoverOpen(false);
      }
    }, 150);
  }, [isWorkspaceLockedOpen, cancelCloseTimer]);

  const handleWorkspacePointerEnter = useCallback(() => {
    // Mark that pointer is over workspace (capture phase)
    setIsWorkspaceInteracting(true);
  }, []);

  const handleWorkspacePointerLeave = useCallback(() => {
    // Pointer left workspace, allow sidebar expansion again after popover closes
    if (!isWorkspacePopoverOpen && !isWorkspaceLockedOpen) {
      setIsWorkspaceInteracting(false);
    }
  }, [isWorkspacePopoverOpen, isWorkspaceLockedOpen]);

  const handleWorkspaceMouseEnter = useCallback(() => {
    // Only show popover when sidebar is collapsed
    if (!isHovered) {
      cancelCloseTimer();
      updatePopoverPosition();
      setIsWorkspacePopoverOpen(true);
    }
  }, [isHovered, cancelCloseTimer, updatePopoverPosition]);

  const handleWorkspaceMouseLeave = useCallback(() => {
    if (!isWorkspaceLockedOpen) {
      startCloseTimer();
    }
  }, [isWorkspaceLockedOpen, startCloseTimer]);

  const handleWorkspacePopoverFullClose = useCallback(() => {
    setIsWorkspaceInteracting(false);
  }, []);

  const handlePopoverMouseEnter = useCallback(() => {
    cancelCloseTimer();
  }, [cancelCloseTimer]);

  const handlePopoverMouseLeave = useCallback(() => {
    if (!isWorkspaceLockedOpen) {
      startCloseTimer();
    }
  }, [isWorkspaceLockedOpen, startCloseTimer]);

  const handleWorkspaceClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHovered) {
      // Toggle locked state when sidebar is collapsed
      setIsWorkspaceLockedOpen((prev) => !prev);
      if (!isWorkspacePopoverOpen) {
        updatePopoverPosition();
        setIsWorkspacePopoverOpen(true);
      }
    }
  }, [isHovered, isWorkspacePopoverOpen, updatePopoverPosition]);

  // Auto-close when sidebar expands/collapses
  useEffect(() => {
    if (previousIsHoveredRef.current !== isHovered) {
      setIsWorkspacePopoverOpen(false);
      setIsWorkspaceLockedOpen(false);
      cancelCloseTimer();
      previousIsHoveredRef.current = isHovered;
    }
  }, [isHovered, cancelCloseTimer]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isWorkspacePopoverOpen &&
        workspacePopoverRef.current &&
        !workspacePopoverRef.current.contains(e.target as Node) &&
        workspaceButtonRef.current &&
        !workspaceButtonRef.current.contains(e.target as Node)
      ) {
        setIsWorkspacePopoverOpen(false);
        setIsWorkspaceLockedOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isWorkspacePopoverOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWorkspacePopoverOpen) {
        setIsWorkspacePopoverOpen(false);
        setIsWorkspaceLockedOpen(false);
        workspaceButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isWorkspacePopoverOpen]);

  // Reposition on window resize/scroll (throttled)
  useEffect(() => {
    if (!isWorkspacePopoverOpen) return;

    let rafId: number | null = null;
    const handleRepositioning = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updatePopoverPosition();
        rafId = null;
      });
    };

    window.addEventListener('resize', handleRepositioning);
    window.addEventListener('scroll', handleRepositioning, true);

    return () => {
      window.removeEventListener('resize', handleRepositioning);
      window.removeEventListener('scroll', handleRepositioning, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isWorkspacePopoverOpen, updatePopoverPosition]);

  return (
    <>
      <InviteModal open={showInviteModal} onOpenChange={setShowInviteModal} />
      <CreateTeamModal open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal} />
      <CreateProjectModal open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal} />
      
      <div 
        className={cn(
          "bg-gray-900 dark:bg-gray-950 border-r border-gray-800 dark:border-gray-900 flex flex-col h-screen transition-all duration-300 ease-in-out",
          isHovered ? "w-56" : "w-20"
        )}
        onMouseEnter={() => {
          // Don't expand sidebar if user is interacting with workspace
          if (!isWorkspaceInteracting) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Workspace Button */}
        <div className="p-3 border-b border-gray-800 dark:border-gray-900">
          <button
            ref={workspaceButtonRef}
            className={cn(
              "w-full flex items-center gap-3 hover:bg-gray-800/50 rounded-lg p-2 transition-all group",
              isHovered ? "justify-start" : "justify-center"
            )}
            onPointerOverCapture={handleWorkspacePointerEnter}
            onPointerOutCapture={handleWorkspacePointerLeave}
            onMouseEnter={handleWorkspaceMouseEnter}
            onMouseLeave={handleWorkspaceMouseLeave}
            onClick={handleWorkspaceClick}
            data-testid="button-workspace-dropdown"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-teal-600 text-white font-semibold text-sm">
                {workspaceInitial}
              </AvatarFallback>
            </Avatar>
            {isHovered && (
              <>
                <span className="text-white font-medium text-sm flex-1 text-left truncate">
                  {workspaceName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Workspace Popover Portal */}
        <AnimatePresence onExitComplete={handleWorkspacePopoverFullClose}>
          {isWorkspacePopoverOpen && !isHovered && (
            <motion.div
              ref={workspacePopoverRef}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8,
              }}
              style={{
                position: 'fixed',
                top: popoverPosition.top,
                left: popoverPosition.left,
                transform: 'translateY(-50%)',
                zIndex: 50,
              }}
              className="w-72 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              data-testid="workspace-popover"
            >
              {/* Workspace Info */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-teal-600 text-white font-semibold">
                    {workspaceInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate" data-testid="text-workspace-name">
                    {workspaceName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-member-count">
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-plan-type">
                      Free Forever
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <button 
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      data-testid="button-upgrade"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs gap-2 border-gray-300 dark:border-gray-600"
                  data-testid="button-settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs gap-2 border-gray-300 dark:border-gray-600"
                  data-testid="button-people"
                >
                  <Users className="h-3.5 w-3.5" />
                  People
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {/* Section-based Navigation */}
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.label}>
              {/* Section Label */}
              {isHovered && (
                <div className={cn(
                  "px-4 text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-2",
                  sectionIndex > 0 ? "mt-6" : "mt-0"
                )}>
                  {section.label}
                </div>
              )}
              
              {/* Section Items */}
              {section.items.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.id} href={item.path}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 transition-all relative group",
                        isHovered ? "px-4 h-10 mb-1" : "px-0 h-10 mb-1 justify-center",
                        isActive && isHovered && "bg-gray-800/70 rounded-lg mx-2",
                        isActive && !isHovered && "bg-gray-800/50",
                        !isActive && "hover:bg-gray-800/40",
                        isHovered && !isActive && "rounded-lg mx-2 hover:bg-gray-800/40"
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? item.color : "text-gray-400 group-hover:text-gray-300"
                      )} />
                      {isHovered && (
                        <span className={cn(
                          "text-sm font-medium whitespace-nowrap",
                          isActive ? "text-white font-semibold" : "text-gray-400 group-hover:text-gray-300"
                        )}>
                          {item.name}
                        </span>
                      )}
                      {isActive && !isHovered && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r" />
                      )}
                      {isActive && isHovered && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r" />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Projects Section (part of Planning & Strategy) */}
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className={cn(
              "w-full flex items-center gap-3 transition-all group",
              isHovered ? "px-4 h-10 mb-1 rounded-lg mx-2 hover:bg-gray-800/40" : "px-0 h-10 mb-1 justify-center hover:bg-gray-800/40"
            )}
            data-testid="button-toggle-projects"
          >
            <Folder className="h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
            {isHovered && (
              <>
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 flex-1 text-left">
                  Projects
                </span>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateProjectModal(true);
                  }}
                  className="w-6 h-6 rounded border border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  data-testid="button-add-project"
                >
                  <Plus className="h-3.5 w-3.5 text-gray-600 hover:text-gray-400" />
                </div>
                {projectsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                )}
              </>
            )}
          </button>

          {/* Project Items (shown when expanded) */}
          {projectsExpanded && workspaceProjects.length === 0 && isHovered && (
            <div className="pl-12 pr-4 py-2 text-xs text-gray-500">
              No projects yet
            </div>
          )}
          {projectsExpanded && workspaceProjects.map((project) => (
            <div key={project.id} className="relative group/project">
              <Link href={`/projects/${project.id}`}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative",
                    location === `/projects/${project.id}` && "bg-gray-800/50",
                    location !== `/projects/${project.id}` && "hover:bg-gray-800/30",
                    isHovered ? "pl-12 pr-10 py-2.5" : "px-0 py-2.5 justify-center"
                  )}
                  data-testid={`nav-project-${project.id}`}
                >
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap flex-1 truncate",
                      location === `/projects/${project.id}` ? "text-white" : "text-gray-400 group-hover/project:text-gray-300"
                    )}>
                      {project.name}
                    </span>
                  )}
                  {location === `/projects/${project.id}` && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r"
                      style={{ backgroundColor: project.color }}
                    />
                  )}
                </button>
              </Link>
              {isHovered && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded hover:bg-gray-700 flex items-center justify-center opacity-0 group-hover/project:opacity-100 transition-opacity"
                      onClick={(e) => e.preventDefault()}
                      data-testid={`button-project-actions-${project.id}`}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenInNewTab(project.id);
                      }}
                      data-testid={`action-open-new-tab-${project.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      data-testid={`action-delete-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}

          {/* Collaboration Section */}
          {isHovered && (
            <div className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-2 mt-6">
              Collaboration
            </div>
          )}
          
          {/* Docs Section */}
          <button
            onClick={() => setDocsExpanded(!docsExpanded)}
            className={cn(
              "w-full flex items-center gap-3 transition-all group",
              isHovered ? "px-4 h-10 mb-1 rounded-lg mx-2 hover:bg-gray-800/40" : "px-0 h-10 mb-1 justify-center hover:bg-gray-800/40"
            )}
            data-testid="button-toggle-docs"
          >
            <FileText className="h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
            {isHovered && (
              <>
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 flex-1 text-left">
                  Docs
                </span>
                {docsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                )}
              </>
            )}
          </button>

          {/* Docs Sub-items (shown when expanded) */}
          {docsExpanded && (
            <>
              <Link href="/docs">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative group",
                    location === '/docs' && "bg-gray-800/50",
                    location !== '/docs' && "hover:bg-gray-800/30",
                    isHovered ? "pl-12 pr-4 py-2.5" : "px-0 py-2.5 justify-center"
                  )}
                  data-testid="nav-docs-all"
                >
                  <Files className={cn("h-5 w-5 flex-shrink-0", location === '/docs' ? "text-orange-500" : "text-gray-400 group-hover:text-gray-300")} />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      location === '/docs' ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      All Docs
                    </span>
                  )}
                  {location === '/docs' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r" />
                  )}
                </button>
              </Link>

              <Link href="/docs/my">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative group",
                    location === '/docs/my' && "bg-gray-800/50",
                    location !== '/docs/my' && "hover:bg-gray-800/30",
                    isHovered ? "pl-12 pr-4 py-2.5" : "px-0 py-2.5 justify-center"
                  )}
                  data-testid="nav-docs-my"
                >
                  <FileText className={cn("h-5 w-5 flex-shrink-0", location === '/docs/my' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-300")} />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      location === '/docs/my' ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      Created by me
                    </span>
                  )}
                  {location === '/docs/my' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
                  )}
                </button>
              </Link>

              <Link href="/docs/meeting-notes">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative group",
                    location === '/docs/meeting-notes' && "bg-gray-800/50",
                    location !== '/docs/meeting-notes' && "hover:bg-gray-800/30",
                    isHovered ? "pl-12 pr-4 py-2.5" : "px-0 py-2.5 justify-center"
                  )}
                  data-testid="nav-docs-meeting-notes"
                >
                  <Notebook className={cn("h-5 w-5 flex-shrink-0", location === '/docs/meeting-notes' ? "text-green-500" : "text-gray-400 group-hover:text-gray-300")} />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      location === '/docs/meeting-notes' ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      Meeting Notes
                    </span>
                  )}
                  {location === '/docs/meeting-notes' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r" />
                  )}
                </button>
              </Link>
            </>
          )}

          {/* Teams Section */}
          <button
            onClick={() => setTeamsExpanded(!teamsExpanded)}
            className={cn(
              "w-full flex items-center gap-3 transition-all group",
              isHovered ? "px-4 h-10 mb-1 rounded-lg mx-2 hover:bg-gray-800/40" : "px-0 h-10 mb-1 justify-center hover:bg-gray-800/40"
            )}
            data-testid="button-toggle-teams"
          >
            <UsersRound className="h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
            {isHovered && (
              <>
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 flex-1 text-left">
                  Teams
                </span>
                {user && (user.role === 'admin' || user.role === 'sub-admin') && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateTeamModal(true);
                    }}
                    className="w-6 h-6 rounded border border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    data-testid="button-add-team"
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-600 hover:text-gray-400" />
                  </div>
                )}
                {teamsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-300 flex-shrink-0" />
                )}
              </>
            )}
          </button>

          {/* Team Items (shown when expanded) */}
          {teamsExpanded && teams.map((team) => {
            const teamPath = `/${team.name.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}`;
            const isActive = location === teamPath;
            const TeamIcon = iconMap[team.icon] || Users;
            
            return (
              <Link key={team.id} href={teamPath}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative group",
                    isActive && "bg-gray-800/50",
                    !isActive && "hover:bg-gray-800/30",
                    isHovered ? "pl-12 pr-4 py-2.5" : "px-0 py-2.5 justify-center"
                  )}
                  data-testid={`nav-team-${team.id}`}
                >
                  <TeamIcon 
                    className="h-5 w-5 flex-shrink-0" 
                    style={{ color: isActive ? team.color : undefined }}
                    {...(!isActive && { className: "h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0" })}
                  />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      {team.name}
                    </span>
                  )}
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r"
                      style={{ backgroundColor: team.color }}
                    />
                  )}
                </button>
              </Link>
            );
          })}
          
          {/* Admin & Access Section */}
          {user && (user.role === 'admin' || user.role === 'sub-admin') && (
            <>
              {isHovered && (
                <div className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-2 mt-6">
                  Admin & Access
                </div>
              )}
              <Link href="/admin">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 transition-all relative group",
                    isHovered ? "px-4 h-10 mb-1 rounded-lg mx-2" : "px-0 h-10 mb-1 justify-center",
                    location === '/admin' && isHovered && "bg-gray-800/70 rounded-lg",
                    location === '/admin' && !isHovered && "bg-gray-800/50",
                    location !== '/admin' && "hover:bg-gray-800/40"
                  )}
                  data-testid="nav-admin"
                >
                  <Shield className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    location === '/admin' ? "text-red-400" : "text-gray-400 group-hover:text-gray-300"
                  )} />
                  {isHovered && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      location === '/admin' ? "text-white font-semibold" : "text-gray-400 group-hover:text-gray-300"
                    )}>
                      Admin
                    </span>
                  )}
                  {location === '/admin' && !isHovered && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r" />
                  )}
                  {location === '/admin' && isHovered && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r" />
                  )}
                </button>
              </Link>
              
              {/* Invite Button (under Admin & Access) */}
              <button
                onClick={() => setShowInviteModal(true)}
                className={cn(
                  "w-full flex items-center gap-3 transition-all group",
                  isHovered ? "px-4 h-10 mb-1 rounded-lg mx-2 hover:bg-gray-800/40" : "px-0 h-10 mb-1 justify-center hover:bg-gray-800/40"
                )}
                data-testid="button-invite"
              >
                <UserPlus className="h-5 w-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0 transition-colors" />
                {isHovered && (
                  <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 whitespace-nowrap">
                    Invite
                  </span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
