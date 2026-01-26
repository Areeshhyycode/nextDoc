interface LoginStatItemProps {
  userId: string;
  displayName: string;
  email: string;
  loginCount: number;
  lastLogin: Date;
}

/**
 * Reusable login stat item for displaying user login info
 */
export function LoginStatItem({
  userId,
  displayName,
  email,
  loginCount,
  lastLogin,
}: LoginStatItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border bg-card"
      data-testid={`login-stat-${userId}`}
    >
      <div>
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{loginCount} logins</p>
        <p className="text-sm text-muted-foreground">
          Last: {new Date(lastLogin).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
