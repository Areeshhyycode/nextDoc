import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Lock, Users as UsersIcon, Globe, UserPlus, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StepIndicator } from "@/components/ui/step-indicator";
import { SelectionCard } from "@/components/ui/selection-card";
import { CountBadge } from "@/components/ui/count-badge";
import type { User } from "@shared/schema";

interface StepInviteMembersProps {
  privacy: "private" | "everyone" | "specific_people";
  onPrivacyChange: (privacy: "private" | "everyone" | "specific_people") => void;
  selectedMembers: string[];
  onToggleMember: (userId: string) => void;
  users: User[];
  onShowInviteModal: () => void;
}

export function StepInviteMembers({
  privacy,
  onPrivacyChange,
  selectedMembers,
  onToggleMember,
  users,
  onShowInviteModal,
}: StepInviteMembersProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberPopover, setShowMemberPopover] = useState(false);

  return (
    <div className="space-y-6 py-4">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          Projects are better with others!{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            onClick={onShowInviteModal}
          >
            Add a new workspace member.
          </span>
        </p>
      </div>

      <div className="space-y-3">
        <SelectionCard
          isSelected={privacy === "private"}
          onClick={() => onPrivacyChange("private")}
          icon={Lock}
          title="Private to me"
          description="Only you will be able to view this project and its actions."
          testId="privacy-private"
        />

        <SelectionCard
          isSelected={privacy === "specific_people"}
          onClick={() => onPrivacyChange("specific_people")}
          icon={UsersIcon}
          title="Specific people"
          description="Invite specific people to your project. You can edit project member permissions later."
          testId="privacy-specific-people"
        >
          {privacy === "specific_people" && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMemberPopover(!showMemberPopover);
                }}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                data-testid="button-select-members"
              >
                <UsersIcon className="h-4 w-4" />
                Select members
                <CountBadge count={selectedMembers.length} />
              </button>

              {showMemberPopover && (
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search name or email"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="pl-9 h-8 text-sm"
                        data-testid="input-member-search"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1.5">Workspace members</div>
                    {users
                      .filter(user =>
                        user.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        user.email.toLowerCase().includes(memberSearch.toLowerCase())
                      )
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleMember(user.id);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          data-testid={`member-${user.id}`}
                        >
                          <UserAvatar name={user.displayName} size="sm" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-medium truncate">{user.displayName}</div>
                          </div>
                          <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                            {selectedMembers.includes(user.id) && (
                              <Check className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMemberPopover(false);
                        onShowInviteModal();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors mt-1"
                      data-testid="button-invite-new-member"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite new teammate
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMemberPopover(false);
                      }}
                      className="w-full h-8 text-sm"
                      data-testid="button-close-member-popover"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SelectionCard>

        <SelectionCard
          isSelected={privacy === "everyone"}
          onClick={() => onPrivacyChange("everyone")}
          icon={Globe}
          title="Everyone"
          description="Invite all members in your workspace to this project."
          testId="privacy-everyone"
        />
      </div>

      <StepIndicator totalSteps={3} currentStep={2} className="pt-4" />
    </div>
  );
}
