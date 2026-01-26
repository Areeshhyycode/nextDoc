import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SecurityTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onChangePassword: () => void;
  isPending: boolean;
}

export function SecurityTab({
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
  isPending
}: SecurityTabProps) {
  return (
    <div className="mt-8 space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => onCurrentPasswordChange(e.target.value)}
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
          onChange={(e) => onNewPasswordChange(e.target.value)}
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
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          className="h-11"
          data-testid="input-confirm-password"
        />
      </div>

      <Button
        onClick={onChangePassword}
        disabled={isPending}
        className="h-11 px-6"
        data-testid="button-change-password"
      >
        Change password
      </Button>
    </div>
  );
}
