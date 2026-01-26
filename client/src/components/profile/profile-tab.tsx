import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileHeader } from "./profile-header";

interface ProfileTabProps {
  user: { displayName: string; email: string } | undefined;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  birthdayDay: string;
  birthdayMonth: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBirthdayDayChange: (value: string) => void;
  onBirthdayMonthChange: (value: string) => void;
  onSave: () => void;
  isPending: boolean;
}

const COUNTRIES = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ProfileTab({
  user,
  firstName,
  lastName,
  country,
  phone,
  birthdayDay,
  birthdayMonth,
  onFirstNameChange,
  onLastNameChange,
  onCountryChange,
  onPhoneChange,
  onBirthdayDayChange,
  onBirthdayMonthChange,
  onSave,
  isPending
}: ProfileTabProps) {
  return (
    <div className="mt-8 space-y-6">
      {user && <ProfileHeader displayName={user.displayName} email={user.email} />}

      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm text-muted-foreground">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="h-11"
            data-testid="input-first-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="h-11"
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-3xl">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm text-muted-foreground">Country</Label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="h-11" data-testid="select-country">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+92  3341118847"
            className="h-11"
            data-testid="input-phone"
          />
        </div>
      </div>

      <div className="space-y-2 max-w-3xl">
        <Label className="text-sm text-muted-foreground">Birthday</Label>
        <div className="flex gap-4">
          <Input
            placeholder="Day"
            value={birthdayDay}
            onChange={(e) => onBirthdayDayChange(e.target.value)}
            className="w-24 h-11"
            data-testid="input-birthday-day"
          />
          <Select value={birthdayMonth} onValueChange={onBirthdayMonthChange}>
            <SelectTrigger className="w-48 h-11" data-testid="select-birthday-month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onSave}
        disabled={isPending}
        className="h-11 px-6"
        data-testid="button-save-profile"
      >
        Save
      </Button>
    </div>
  );
}
