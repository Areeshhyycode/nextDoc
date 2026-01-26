import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileSettings } from "@/hooks/use-profile-settings";
import { ProfileTab } from "@/components/profile/profile-tab";
import { PreferencesTab } from "@/components/profile/preferences-tab";
import { SecurityTab } from "@/components/profile/security-tab";

export default function ProfileSettings() {
  const {
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
    isProfilePending,
    isPasswordPending
  } = useProfileSettings();

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

          <TabsContent value="profile">
            <ProfileTab
              user={user}
              firstName={firstName}
              lastName={lastName}
              country={country}
              phone={phone}
              birthdayDay={birthdayDay}
              birthdayMonth={birthdayMonth}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onCountryChange={setCountry}
              onPhoneChange={setPhone}
              onBirthdayDayChange={setBirthdayDay}
              onBirthdayMonthChange={setBirthdayMonth}
              onSave={handleSaveProfile}
              isPending={isProfilePending}
            />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesTab
              language={language}
              timezone={timezone}
              theme={theme}
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              weekFormat={weekFormat}
              onLanguageChange={setLanguage}
              onTimezoneChange={setTimezone}
              onThemeChange={setTheme}
              onDateFormatChange={setDateFormat}
              onTimeFormatChange={setTimeFormat}
              onWeekFormatChange={setWeekFormat}
              onSave={handleSavePreferences}
              isPending={isProfilePending}
            />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onChangePassword={handleChangePassword}
              isPending={isPasswordPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
