import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { COLOR_PRESET_VALUES } from "@/constants/color-presets";
import { StepIndicator } from "@/components/ui/step-indicator";

interface StepProjectDetailsProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  projectColor: string;
  onProjectColorChange: (color: string) => void;
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
}

export function StepProjectDetails({
  projectName,
  onProjectNameChange,
  projectColor,
  onProjectColorChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: StepProjectDetailsProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-[1fr_auto] gap-6">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            placeholder="New project"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            data-testid="input-project-name"
          />
        </div>

        <div className="space-y-2">
          <Label>Project color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-20 h-10 rounded-md border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: projectColor }}
                data-testid="button-project-color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESET_VALUES.map((color) => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-md border-2 border-transparent hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => onProjectColorChange(color)}
                    data-testid={`color-${color}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Project dates</Label>
        <div className="grid grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                data-testid="button-start-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={onStartDateChange} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                data-testid="button-end-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={onEndDateChange} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <StepIndicator totalSteps={3} currentStep={1} className="pt-4" />
    </div>
  );
}
