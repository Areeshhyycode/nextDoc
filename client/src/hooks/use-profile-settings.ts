import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export function useProfileSettings() {
  const { toast } = useToast();
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/users/change-password", data);
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Success", description: "Password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to change password", variant: "destructive" });
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
      toast({ title: "No changes", description: "Please make changes before saving", variant: "default" });
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
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return {
    user,
    // Profile
    firstName, setFirstName,
    lastName, setLastName,
    country, setCountry,
    phone, setPhone,
    birthdayDay, setBirthdayDay,
    birthdayMonth, setBirthdayMonth,
    handleSaveProfile,
    // Preferences
    language, setLanguage,
    timezone, setTimezone,
    theme, setTheme,
    dateFormat, setDateFormat,
    timeFormat, setTimeFormat,
    weekFormat, setWeekFormat,
    handleSavePreferences,
    // Security
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    handleChangePassword,
    // Loading states
    isProfilePending: updateProfileMutation.isPending,
    isPasswordPending: changePasswordMutation.isPending,
  };
}
