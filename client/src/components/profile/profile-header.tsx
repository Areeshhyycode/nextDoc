interface ProfileHeaderProps {
  displayName: string;
  email: string;
}

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ProfileHeader({ displayName, email }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-xl font-semibold">
        {getInitials(displayName)}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{email}</span>
          <button className="text-sm text-blue-500 hover:underline" data-testid="button-change-email">
            change email
          </button>
        </div>
      </div>
    </div>
  );
}
