import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function ProfileSettings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: user } = useQuery<User>({ queryKey: ["/api/auth/user"] });
  
  // My Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdayDay, setBirthdayDay] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState("");
  
  // Preferences state
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("(GMT+00:00) UTC");
  const [theme, setTheme] = useState("Auto");
  const [dateFormat, setDateFormat] = useState("31 Dec 2025");
  const [timeFormat, setTimeFormat] = useState("12");
  const [weekFormat, setWeekFormat] = useState("Monday");
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize form state when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setCountry(user.country || "");
      setPhone(user.phone || "");
      
      // Parse birthday if exists
      if (user.birthday) {
        const parts = user.birthday.split("/");
        if (parts.length === 2) {
          setBirthdayDay(parts[0]);
          setBirthdayMonth(parts[1]);
        }
      }
      
      setLanguage(user.language || "English");
      setTimezone(user.timezone || "(GMT+00:00) UTC");
      setTheme(user.theme || "Auto");
      setDateFormat(user.dateFormat || "31 Dec 2025");
      setTimeFormat(user.timeFormat || "12");
      setWeekFormat(user.weekFormat || "Monday");
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/users/change-password", data);
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    const birthday = birthdayDay && birthdayMonth ? `${birthdayDay}/${birthdayMonth}` : undefined;
    
    const updates: Partial<User> = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (country) updates.country = country;
    if (phone) updates.phone = phone;
    if (birthday) updates.birthday = birthday;
    
    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes",
        description: "Please make changes before saving",
        variant: "default",
      });
      return;
    }
    
    updateProfileMutation.mutate(updates);
  };

  const handleSavePreferences = () => {
    updateProfileMutation.mutate({
      language,
      timezone,
      theme,
      dateFormat,
      timeFormat,
      weekFormat,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Profile settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 text-muted-foreground px-0 mr-8"
              data-testid="tab-my-profile"
            >
              My profile
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 text-muted-foreground px-0 mr-8"
              data-testid="tab-preferences"
            >
              Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 text-muted-foreground px-0"
              data-testid="tab-security"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* My Profile Tab */}
          <TabsContent value="profile" className="mt-8 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-xl font-semibold">
                {user && getInitials(user.displayName)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{user?.displayName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                  <button className="text-sm text-blue-500 hover:underline" data-testid="button-change-email">
                    change email
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm text-muted-foreground">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm text-muted-foreground">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-11" data-testid="select-country">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pakistan">Pakistan</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  onChange={(e) => setBirthdayDay(e.target.value)}
                  className="w-24 h-11"
                  data-testid="input-birthday-day"
                />
                <Select value={birthdayMonth} onValueChange={setBirthdayMonth}>
                  <SelectTrigger className="w-48 h-11" data-testid="select-birthday-month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="February">February</SelectItem>
                    <SelectItem value="March">March</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="May">May</SelectItem>
                    <SelectItem value="June">June</SelectItem>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="August">August</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                    <SelectItem value="October">October</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="December">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={updateProfileMutation.isPending}
              className="h-11 px-6"
              data-testid="button-save-profile"
            >
              Save
            </Button>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-8 space-y-6 max-w-md">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Language (beta)</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-11" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Time zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-11" data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="(GMT+00:00) UTC">(GMT+00:00) UTC</SelectItem>
                  <SelectItem value="(GMT+05:00) Karachi">(GMT+05:00) Karachi</SelectItem>
                  <SelectItem value="(GMT-05:00) New York">(GMT-05:00) New York</SelectItem>
                  <SelectItem value="(GMT+01:00) London">(GMT+01:00) London</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="h-11" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Date format</Label>
              <div className="flex gap-4">
                <Button
                  variant={dateFormat === "31 Dec 2025" ? "default" : "outline"}
                  onClick={() => setDateFormat("31 Dec 2025")}
                  className="h-11"
                  data-testid="button-date-format-1"
                >
                  31 Dec 2025
                </Button>
                <Button
                  variant={dateFormat === "Dec 31, 2025" ? "default" : "outline"}
                  onClick={() => setDateFormat("Dec 31, 2025")}
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
                  onClick={() => setTimeFormat("12")}
                  className="h-11 flex-1"
                  data-testid="button-time-format-12"
                >
                  12 hours: 9.00 PM
                </Button>
                <Button
                  variant={timeFormat === "24" ? "default" : "outline"}
                  onClick={() => setTimeFormat("24")}
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
                  onClick={() => setWeekFormat("Monday")}
                  className="h-11 flex-1"
                  data-testid="button-week-format-monday"
                >
                  Monday
                </Button>
                <Button
                  variant={weekFormat === "Sunday" ? "default" : "outline"}
                  onClick={() => setWeekFormat("Sunday")}
                  className="h-11 flex-1"
                  data-testid="button-week-format-sunday"
                >
                  Sunday
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSavePreferences} 
              disabled={updateProfileMutation.isPending}
              className="h-11 px-6"
              data-testid="button-save-preferences"
            >
              Save
            </Button>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-8 space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11"
                data-testid="input-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-muted-foreground">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                data-testid="input-confirm-password"
              />
            </div>

            <Button 
              onClick={handleChangePassword} 
              disabled={changePasswordMutation.isPending}
              className="h-11 px-6"
              data-testid="button-change-password"
            >
              Change password
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
