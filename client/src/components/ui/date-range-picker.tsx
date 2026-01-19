import React, { useState, useEffect } from "react";
import { format, addDays, addWeeks, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const presetRanges = [
  {
    label: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Yesterday", 
    getValue: () => ({
      from: startOfDay(addDays(new Date(), -1)),
      to: endOfDay(addDays(new Date(), -1)),
    }),
  },
  {
    label: "This Week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
      to: endOfWeek(new Date(), { weekStartsOn: 1 }), // Sunday
    }),
  },
  {
    label: "Last Week",
    getValue: () => ({
      from: startOfWeek(addWeeks(new Date(), -1), { weekStartsOn: 1 }),
      to: endOfWeek(addWeeks(new Date(), -1), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Last Month",
    getValue: () => ({
      from: startOfDay(addDays(new Date(), -30)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 90 Days",
    getValue: () => ({
      from: startOfDay(addDays(new Date(), -90)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 6 Months",
    getValue: () => ({
      from: startOfDay(addMonths(new Date(), -6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 12 Months",
    getValue: () => ({
      from: startOfDay(addMonths(new Date(), -12)),
      to: endOfDay(new Date()),
    }),
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const handlePresetSelect = (presetLabel: string) => {
    const preset = presetRanges.find(p => p.label === presetLabel);
    if (preset) {
      const range = preset.getValue();
      onChange?.(range);
      setSelectedPreset(presetLabel);
    }
  };

  const handleDateSelect = (selectedRange: { from?: Date; to?: Date } | undefined) => {
    if (!selectedRange) {
      onChange?.(undefined);
      setSelectedPreset("");
      return;
    }
    
    onChange?.({
      from: selectedRange.from,
      to: selectedRange.to,
    });
    setSelectedPreset("");
  };

  const handleClear = () => {
    onChange?.(undefined);
    setSelectedPreset("");
  };

  // Clear preset selection when date is manually changed
  useEffect(() => {
    if (value?.from || value?.to) {
      const matchingPreset = presetRanges.find(preset => {
        const presetRange = preset.getValue();
        return presetRange.from?.getTime() === value.from?.getTime() && 
               presetRange.to?.getTime() === value.to?.getTime();
      });
      if (!matchingPreset) {
        setSelectedPreset("");
      }
    }
  }, [value]);

  const formatDateRange = () => {
    if (!value?.from) {
      return placeholder;
    }
    
    if (!value.to) {
      return format(value.from, "MMM dd, yyyy");
    }
    
    return `${format(value.from, "MMM dd, yyyy")} - ${format(value.to, "MMM dd, yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[280px] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg border-gray-200 dark:border-gray-700" align="start">
        <div className="bg-white dark:bg-gray-900">
          {/* Header with Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                <SelectTrigger className="w-[140px] h-8 text-xs border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Quick select" />
                </SelectTrigger>
                <SelectContent>
                  {presetRanges.map((preset) => (
                    <SelectItem key={preset.label} value={preset.label} className="text-xs">
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {(value?.from || value?.to) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  className="h-8 px-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 px-3 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
          
          {/* Calendar Section */}
          <div className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMonth(addMonths(month, -1))}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="mx-4 min-w-[280px] text-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {format(month, "MMMM yyyy")} - {format(addMonths(month, 1), "MMMM yyyy")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMonth(addMonths(month, 1))}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Dual Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="range"
                selected={value}
                onSelect={handleDateSelect}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={2}
                showOutsideDays={false}
                className="rounded-md"
                classNames={{
                  months: "flex space-x-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-8 font-normal text-xs",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  day: "h-8 w-8 p-0 font-normal text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                  day_selected: "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-50 focus:bg-gray-900 dark:focus:bg-gray-50 focus:text-white dark:focus:text-gray-900",
                  day_range_start: "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 rounded-full",
                  day_range_end: "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 rounded-full",
                  day_range_middle: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-none",
                  day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium",
                  day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
                  day_disabled: "text-gray-400 dark:text-gray-600 opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}