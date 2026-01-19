import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronDown, User, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { TeamMember } from '@shared/schema';

interface InlineTaskCreatorProps {
  columnName: string;
  teamMembers: TeamMember[];
  onSave: (taskData: {
    task: string;
    dueDate: string | null;
    owner: string | null;
    effortEstimate: number | null;
    taskType: string | null;
  }) => void;
  onCancel: () => void;
}

const TASK_TYPES = [
  { value: 'Operational', color: '#3B82F6', label: 'Operational' },
  { value: 'Technical', color: '#10B981', label: 'Technical' },
  { value: 'Strategic', color: '#8B5CF6', label: 'Strategic' },
  { value: 'Hiring', color: '#F59E0B', label: 'Hiring' },
  { value: 'Financial', color: '#EF4444', label: 'Financial' },
];

const TIME_PRESETS = [
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
  { label: '8h', value: 480 },
  { label: '16h', value: 960 },
];

export function InlineTaskCreator({ columnName, teamMembers, onSave, onCancel }: InlineTaskCreatorProps) {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [selectedOwner, setSelectedOwner] = useState<TeamMember | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [taskType, setTaskType] = useState<string | null>(null);

  const handleSave = () => {
    if (!taskName.trim()) return;

    onSave({
      task: taskName.trim(),
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      owner: selectedOwner?.id || null,
      effortEstimate: estimatedTime,
      taskType: taskType,
    });
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'hh:mm';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3 space-y-3 shadow-sm" data-testid="inline-task-creator">
      {/* Task Name Input */}
      <div className="relative">
        <Input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task name (type / for options)"
          className="w-full"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancel();
          }}
          data-testid="input-task-name"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Estimated Time Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">Estimated time:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-32 justify-between text-gray-600"
              data-testid="dropdown-estimated-time"
            >
              <span className="text-sm">{formatTime(estimatedTime)}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32" data-testid="menu-time-presets">
            {TIME_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset.value}
                onClick={() => setEstimatedTime(preset.value)}
                data-testid={`time-preset-${preset.value}`}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Calendar Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0" data-testid="button-select-date">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
            <div className="p-3 border-t space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => setDueDate(undefined)}
                data-testid="button-no-due-date"
              >
                <X className="h-4 w-4 mr-2" />
                No due date
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Task Type Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              data-testid="button-select-type"
            >
              {taskType ? (
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: TASK_TYPES.find((t) => t.value === taskType)?.color || '#6B7280' }}
                />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48" data-testid="menu-task-types">
            {TASK_TYPES.map((type) => (
              <DropdownMenuItem
                key={type.value}
                onClick={() => setTaskType(type.value)}
                className="flex items-center gap-2"
                data-testid={`task-type-${type.value.toLowerCase()}`}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }} />
                {type.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => setTaskType(null)}
              className="text-gray-500"
              data-testid="task-type-none"
            >
              Clear selection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              data-testid="button-select-assignee"
            >
              {selectedOwner ? (
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className="text-xs text-white"
                    style={{ backgroundColor: selectedOwner.avatarColor || '#3B82F6' }}
                  >
                    {selectedOwner.initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56" data-testid="menu-assignees">
            <DropdownMenuItem
              onClick={() => setSelectedOwner(null)}
              data-testid="assignee-nobody"
            >
              <User className="h-4 w-4 mr-2 text-gray-400" />
              Nobody
            </DropdownMenuItem>
            {teamMembers.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => setSelectedOwner(member)}
                data-testid={`assignee-${member.id}`}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarFallback
                    className="text-xs text-white"
                    style={{ backgroundColor: member.avatarColor || '#3B82F6' }}
                  >
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                {member.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save Button */}
        <Button
          size="sm"
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSave}
          disabled={!taskName.trim()}
          data-testid="button-save-task"
        >
          Save
        </Button>
      </div>

      {/* Selected Info Display (optional visual feedback) */}
      {(dueDate || taskType || selectedOwner) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
          {dueDate && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(dueDate, 'MMM dd')}
            </span>
          )}
          {estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(estimatedTime)}
            </span>
          )}
          {taskType && (
            <span className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: TASK_TYPES.find((t) => t.value === taskType)?.color || '#6B7280' }}
              />
              {taskType}
            </span>
          )}
          {selectedOwner && (
            <span className="flex items-center gap-1">
              Assigned to {selectedOwner.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
