import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PreferencesTabProps {
  language: string;
  timezone: string;
  theme: string;
  dateFormat: string;
  timeFormat: string;
  weekFormat: string;
  onLanguageChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onDateFormatChange: (value: string) => void;
  onTimeFormatChange: (value: string) => void;
  onWeekFormatChange: (value: string) => void;
  onSave: () => void;
  isPending: boolean;
}

const LANGUAGES = ["English", "Spanish", "French", "German"];
const TIMEZONES = [
  "(GMT+00:00) UTC",
  "(GMT+05:00) Karachi",
  "(GMT-05:00) New York",
  "(GMT+01:00) London"
];
const THEMES = ["Auto", "Light", "Dark"];

export function PreferencesTab({
  language,
  timezone,
  theme,
  dateFormat,
  timeFormat,
  weekFormat,
  onLanguageChange,
  onTimezoneChange,
  onThemeChange,
  onDateFormatChange,
  onTimeFormatChange,
  onWeekFormatChange,
  onSave,
  isPending
}: PreferencesTabProps) {
  return (
    <div className="mt-8 space-y-6 max-w-md">
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Language (beta)</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="h-11" data-testid="select-language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Time zone</Label>
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger className="h-11" data-testid="select-timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(tz => (
              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Theme</Label>
        <Select value={theme} onValueChange={onThemeChange}>
          <SelectTrigger className="h-11" data-testid="select-theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Date format</Label>
        <div className="flex gap-4">
          <Button
            variant={dateFormat === "31 Dec 2025" ? "default" : "outline"}
            onClick={() => onDateFormatChange("31 Dec 2025")}
            className="h-11"
            data-testid="button-date-format-1"
          >
            31 Dec 2025
          </Button>
          <Button
            variant={dateFormat === "Dec 31, 2025" ? "default" : "outline"}
            onClick={() => onDateFormatChange("Dec 31, 2025")}
            className="h-11"
            data-testid="button-date-format-2"
          >
            Dec 31, 2025
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Time format</Label>
        <div className="flex gap-4">
          <Button
            variant={timeFormat === "12" ? "default" : "outline"}
            onClick={() => onTimeFormatChange("12")}
            className="h-11 flex-1"
            data-testid="button-time-format-12"
          >
            12 hours: 9.00 PM
          </Button>
          <Button
            variant={timeFormat === "24" ? "default" : "outline"}
            onClick={() => onTimeFormatChange("24")}
            className="h-11 flex-1"
            data-testid="button-time-format-24"
          >
            24 hours: 21:00
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Week format</Label>
        <div className="flex gap-4">
          <Button
            variant={weekFormat === "Monday" ? "default" : "outline"}
            onClick={() => onWeekFormatChange("Monday")}
            className="h-11 flex-1"
            data-testid="button-week-format-monday"
          >
            Monday
          </Button>
          <Button
            variant={weekFormat === "Sunday" ? "default" : "outline"}
            onClick={() => onWeekFormatChange("Sunday")}
            className="h-11 flex-1"
            data-testid="button-week-format-sunday"
          >
            Sunday
          </Button>
        </div>
      </div>

      <Button
        onClick={onSave}
        disabled={isPending}
        className="h-11 px-6"
        data-testid="button-save-preferences"
      >
        Save
      </Button>
    </div>
  );
}
