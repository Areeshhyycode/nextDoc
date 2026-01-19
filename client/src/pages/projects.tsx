import { useQuery } from "@tanstack/react-query";
import { Plus, Folder } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import type { WorkspaceProject } from "@shared/schema";
import { format } from "date-fns";

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects = [], isLoading } = useQuery<WorkspaceProject[]>({
    queryKey: ["/api/workspace-projects"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-2">
                Manage your workspace projects and collaborate with your team
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to get started with task management
              </p>
              <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-first-project">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4"
                    style={{ borderLeftColor: project.color }}
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <Folder className="h-6 w-6" style={{ color: project.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 truncate">{project.name}</h3>
                        {project.startDate && project.endDate && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {format(new Date(project.startDate), "MMM d")} -{" "}
                            {format(new Date(project.endDate), "MMM d, yyyy")}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-secondary rounded">
                            {project.privacy === "private" ? "Private" : 
                             project.privacy === "everyone" ? "Everyone" : 
                             "Specific People"}
                          </span>
                          <span className="px-2 py-1 bg-secondary rounded">
                            {project.defaultLayout || "list"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
