import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { type Project, type Sprint } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SprintModal } from "@/components/sprints/sprint-modal";
import { SprintCard } from "@/components/sprints/sprint-card";
import { CalendarHeader, CalendarFilters, ViewToggle, TaskDetailsModal, NoSprintsMessage } from "@/components/calendar";
import { getStatusHexColor } from "@/constants/colors";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/calendar/calendar-styles.css";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Project;
}

export function CalendarPage() {
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedTeamMember, setSelectedTeamMember] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    }
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ["/api/sprints"],
    queryFn: async () => {
      const response = await fetch("/api/sprints");
      if (!response.ok) throw new Error("Failed to fetch sprints");
      return response.json();
    }
  });

  const createSprintMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/sprints", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      setIsSprintModalOpen(false);
      toast({ title: "Sprint Created", description: "Sprint has been created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create sprint.", variant: "destructive" });
    }
  });

  const events: CalendarEvent[] = useMemo(() => {
    let filtered = projects;
    if (selectedDepartment !== "all") filtered = filtered.filter((p: Project) => p.department === selectedDepartment);
    if (selectedTeamMember !== "all") filtered = filtered.filter((p: Project) => p.owner === selectedTeamMember);

    return filtered
      .filter((p: Project) => p.scheduledDate || p.dueDate)
      .map((p: Project) => {
        const eventDate = new Date((p.scheduledDate || p.dueDate)!);
        return { id: p.id, title: p.task, start: eventDate, end: new Date(eventDate.getTime() + 3600000), resource: p };
      });
  }, [projects, selectedDepartment, selectedTeamMember]);

  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="p-1 rounded text-xs overflow-hidden" style={{ backgroundColor: getStatusHexColor(event.resource.status), color: 'white' }}>
      <div className="font-medium truncate">{event.resource.task}</div>
      <div className="flex items-center gap-1 mt-1">
        <span className="truncate">{event.resource.owner || 'Unassigned'}</span>
        {event.resource.sprintId && <Target className="h-3 w-3 opacity-75" />}
      </div>
    </div>
  );

  const filteredSprints = useMemo(() => {
    if (selectedTeamMember === "all") return sprints;
    return sprints.filter((s: Sprint) => s.teamMembers?.includes(selectedTeamMember));
  }, [sprints, selectedTeamMember]);

  const activeSprints = filteredSprints.filter((s: Sprint) => s.status === 'Active');

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <CalendarHeader onCreateSprint={() => setIsSprintModalOpen(true)} />

        {activeSprints.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Active Sprints
                {selectedTeamMember !== "all" && <span className="text-base font-normal text-gray-600 dark:text-gray-400 ml-2">for {selectedTeamMember}</span>}
              </h2>
              {selectedTeamMember !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setSelectedTeamMember("all")}>Show All Members</Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSprints.map((sprint: Sprint) => <SprintCard key={sprint.id} sprint={sprint} />)}
            </div>
          </div>
        )}

        {selectedTeamMember !== "all" && filteredSprints.length === 0 && (
          <NoSprintsMessage teamMember={selectedTeamMember} onShowAll={() => setSelectedTeamMember("all")} />
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <CalendarFilters
            selectedDepartment={selectedDepartment}
            selectedTeamMember={selectedTeamMember}
            onDepartmentChange={setSelectedDepartment}
            onTeamMemberChange={setSelectedTeamMember}
            eventsCount={events.length}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>

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
              components={{ event: EventComponent }}
              onSelectEvent={(event) => setSelectedEvent(event)}
              style={{ height: '100%' }}
              className="rbc-calendar-custom"
            />
          </div>
        </div>

        <TaskDetailsModal
          project={selectedEvent?.resource || null}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />

        <SprintModal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          onSubmit={(data) => createSprintMutation.mutate(data)}
          isLoading={createSprintMutation.isPending}
        />
      </div>
    </>
  );
}
