import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  Clock,
  Users,
  Target,
  Plus,
  Filter,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { type Project, type Sprint } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SprintModal } from "@/components/sprints/sprint-modal";
import { SprintCard } from "@/components/sprints/sprint-card";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Project;
}

const statusColors = {
  'Not Started': '#6B7280',
  'In Progress': '#3B82F6',
  'Reviewing': '#F59E0B',
  'Completed': '#10B981',
  'Blocked': '#EF4444',
  'Design Approval Needed': '#8B5CF6',
  'Temporary Hold': '#F97316'
};

export function CalendarPage() {
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects for calendar
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    }
  });

  // Fetch sprints
  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ["/api/sprints"],
    queryFn: async () => {
      const response = await fetch("/api/sprints");
      if (!response.ok) throw new Error("Failed to fetch sprints");
      return response.json();
    }
  });

  // Create sprint mutation
  const createSprintMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/sprints", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      setIsSprintModalOpen(false);
      toast({
        title: "Sprint Created",
        description: "Sprint has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sprint.",
        variant: "destructive"
      });
    }
  });

  // Process projects into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    let filteredProjects = projects;
    
    // Filter by department
    if (selectedDepartment !== "all") {
      filteredProjects = filteredProjects.filter((p: Project) => p.department === selectedDepartment);
    }
    
    // Filter by team member
    if (selectedTeamMember !== "all") {
      filteredProjects = filteredProjects.filter((p: Project) => p.owner === selectedTeamMember);
    }

    return filteredProjects
      .filter((project: Project) => project.scheduledDate || project.dueDate)
      .map((project: Project) => {
        const eventDate = project.scheduledDate || project.dueDate;
        const date = new Date(eventDate!);
        
        return {
          id: project.id,
          title: project.task,
          start: date,
          end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour duration
          resource: project
        };
      });
  }, [projects, selectedDepartment, selectedTeamMember]);

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const project = event.resource;
    const statusColor = statusColors[project.status as keyof typeof statusColors] || '#6B7280';
    
    return (
      <div 
        className="p-1 rounded text-xs overflow-hidden"
        style={{ backgroundColor: statusColor, color: 'white' }}
      >
        <div className="font-medium truncate">{project.task}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="truncate">{project.owner || 'Unassigned'}</span>
          {project.sprintId && (
            <Target className="h-3 w-3 opacity-75" />
          )}
        </div>
      </div>
    );
  };

  const departments = [
    { value: "all", label: "All Departments" },
    { value: "Product", label: "Product" },
    { value: "Design", label: "Design" },
    { value: "Dev", label: "Development" },
    { value: "Marketing & Sales", label: "Marketing & Sales" },
    { value: "Bug Hunting Campaign", label: "Bug Hunting" }
  ];

  const teamMembers = [
    { value: "all", label: "All Team Members" },
    { value: "Zara A", label: "Zara A" },
    { value: "Shaharyar Asgher", label: "Shaharyar Asgher" },
    { value: "Tom Austin", label: "Tom Austin" },
    { value: "Quang (Brett) Ngo", label: "Quang (Brett) Ngo" },
    { value: "Dillon Bong", label: "Dillon Bong" },
    { value: "Thuy (Sweet) Phan Thanh", label: "Thuy (Sweet) Phan Thanh" },
    { value: "heidi fung", label: "heidi fung" },
    { value: "Sam L", label: "Sam L" },
    { value: "Hinora", label: "Hinora" }
  ];

  // Filter sprints by team member if selected
  const filteredSprints = useMemo(() => {
    if (selectedTeamMember === "all") {
      return sprints;
    }
    return sprints.filter((sprint: Sprint) => 
      sprint.teamMembers && sprint.teamMembers.includes(selectedTeamMember)
    );
  }, [sprints, selectedTeamMember]);

  const activeSprints = filteredSprints.filter((sprint: Sprint) => sprint.status === 'Active');
  const planningSprints = filteredSprints.filter((sprint: Sprint) => sprint.status === 'Planning');

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              Calendar & Sprints
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule tasks and manage sprints with drag-and-drop planning
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsSprintModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="create-sprint-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sprint
            </Button>
          </div>
        </div>

        {/* Active Sprints Overview */}
        {activeSprints.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Active Sprints
                {selectedTeamMember !== "all" && (
                  <span className="text-base font-normal text-gray-600 dark:text-gray-400 ml-2">
                    for {selectedTeamMember}
                  </span>
                )}
              </h2>
              {selectedTeamMember !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeamMember("all")}
                  className="text-sm"
                >
                  Show All Members
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSprints.map((sprint: Sprint) => (
                <SprintCard key={sprint.id} sprint={sprint} />
              ))}
            </div>
          </div>
        )}

        {/* No Sprints Message for Filtered Results */}
        {selectedTeamMember !== "all" && filteredSprints.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Sprints Found</h3>
              <p className="text-sm">
                {selectedTeamMember} is not assigned to any sprints currently.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeamMember("all")}
                className="mt-4"
              >
                View All Sprints
              </Button>
            </div>
          </div>
        )}

        {/* Calendar Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[140px]"
                data-testid="department-filter"
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[160px]"
                data-testid="team-member-filter"
              >
                {teamMembers.map(member => (
                  <option key={member.value} value={member.value}>
                    {member.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {events.length} scheduled task{events.length !== 1 ? 's' : ''}
              {selectedTeamMember !== "all" && (
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  for {selectedTeamMember}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(Views.MONTH)}
              className={view === Views.MONTH ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(Views.WEEK)}
              className={view === Views.WEEK ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(Views.DAY)}
              className={view === Views.DAY ? "bg-blue-100 dark:bg-blue-900" : ""}
            >
              Day
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              components={{
                event: EventComponent
              }}
              onSelectEvent={(event) => setSelectedEvent(event)}
              style={{
                height: '100%',
              }}
              className="rbc-calendar-custom"
            />
          </div>
        </div>

        {/* Task Details Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.resource.task}</DialogTitle>
                  <DialogDescription>
                    Task details and scheduling information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: statusColors[selectedEvent.resource.status as keyof typeof statusColors],
                          color: 'white'
                        }}
                      >
                        {selectedEvent.resource.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p>{selectedEvent.resource.department}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Owner</label>
                      <p>{selectedEvent.resource.owner || 'Unassigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Effort</label>
                      <p>{selectedEvent.resource.effortEstimate || 1} points</p>
                    </div>
                  </div>

                  {selectedEvent.resource.dueDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Due Date</label>
                      <p>{format(new Date(selectedEvent.resource.dueDate), 'PPP')}</p>
                    </div>
                  )}

                  {selectedEvent.resource.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-sm">{selectedEvent.resource.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Sprint Creation Modal */}
        <SprintModal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          onSubmit={(data) => createSprintMutation.mutate(data)}
          isLoading={createSprintMutation.isPending}
        />
      </div>

      <style>{`
        .rbc-calendar-custom {
          font-family: inherit;
        }
        .rbc-calendar-custom .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .rbc-calendar-custom .rbc-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          padding: 0.75rem 0.5rem;
        }
        .rbc-calendar-custom .rbc-date-cell {
          padding: 0.5rem;
        }
        .rbc-calendar-custom .rbc-today {
          background-color: #dbeafe;
        }
        .rbc-calendar-custom .rbc-event {
          border: none;
          border-radius: 0.25rem;
          padding: 0;
        }
        .rbc-calendar-custom .rbc-selected {
          outline: 2px solid #3b82f6;
        }
        .dark .rbc-calendar-custom .rbc-header {
          background-color: #374151;
          color: white;
          border-bottom-color: #4b5563;
        }
        .dark .rbc-calendar-custom .rbc-month-view {
          border-color: #4b5563;
        }
        .dark .rbc-calendar-custom .rbc-today {
          background-color: #1e3a8a;
        }
      `}</style>
    </>
  );
}
