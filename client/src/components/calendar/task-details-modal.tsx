import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { type Project } from "@shared/schema";
import { getStatusHexColor } from "@/constants/colors";

interface TaskDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({ project, isOpen, onClose }: TaskDetailsModalProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{project.task}</DialogTitle>
          <DialogDescription>Task details and scheduling information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge variant="secondary" style={{ backgroundColor: getStatusHexColor(project.status), color: 'white' }}>
                {project.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p>{project.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Owner</label>
              <p>{project.owner || 'Unassigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Effort</label>
              <p>{project.effortEstimate || 1} points</p>
            </div>
          </div>

          {project.dueDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Due Date</label>
              <p>{format(new Date(project.dueDate), 'PPP')}</p>
            </div>
          )}

          {project.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-sm">{project.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
