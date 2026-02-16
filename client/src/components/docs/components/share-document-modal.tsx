/**
 * Share Document Modal - ClickUp Style
 *
 * Clean, modern document sharing modal with:
 * - Public link toggle
 * - Export dropdown
 * - User search with inline permissions
 * - Owner and shared users sections
 */

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Users, X } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { useDocumentSharing } from "./share/useDocumentSharing";
import { PublicLinkSection } from "./share/PublicLinkSection";
import { ExportDropdown } from "./share/ExportDropdown";
import { UserSearchSection } from "./share/UserSearchSection";
import { SharedUsersList } from "./share/SharedUsersList";
import { useAuth } from "@/hooks/useAuth";
import type { PermissionType } from "./share/types";

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithOwner;
}

export function ShareDocumentModal({ isOpen, onClose, document: doc }: ShareDocumentModalProps) {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    permission,
    setPermission,
    isSearching,
    shares,
    isLoadingShares,
    shareMutation,
    updatePermissionMutation,
    removeShareMutation,
    publicLinkEnabled,
    togglePublicLinkMutation,
    publicLink,
    availableUsers,
  } = useDocumentSharing(doc, isOpen);

  // Determine the current user's max permission
  // Owner has no limit (null = all permissions available)
  // Non-owner is capped to their own share permission
  const isOwner = user?.id === doc.ownerId;
  const currentUserShare = shares.find(s => s.userId === user?.id);
  const maxPermission: PermissionType | null = isOwner ? null : (currentUserShare?.permission || "view");

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, setSearchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90%] sm:w-[440px] max-w-[440px] p-0 gap-0 overflow-hidden bg-[#1e1e1e] border-[#333] rounded-xl max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-4 border-b border-[#333] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Users className="h-4 w-4 text-teal-400 flex-shrink-0" />
            <h2 className="text-[13px] sm:text-[15px] font-semibold text-white truncate">
              Share "{doc.title}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#333] rounded-md transition-colors flex-shrink-0 touch-manipulation"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-5 overflow-y-auto flex-1">
          {/* Public link toggle - only for owner */}
          {isOwner && (
            <PublicLinkSection
              publicLinkEnabled={publicLinkEnabled}
              publicLink={publicLink}
              onToggle={(checked) => togglePublicLinkMutation.mutate(checked)}
              isToggling={togglePublicLinkMutation.isPending}
            />
          )}

          <ExportDropdown doc={doc} />

          <UserSearchSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            permission={maxPermission || permission}
            onPermissionChange={setPermission}
            availableUsers={availableUsers}
            isSearching={isSearching}
            isPending={shareMutation.isPending}
            onSelectUser={(user) => shareMutation.mutate({ userId: user.id, permission: maxPermission || permission })}
            maxPermission={maxPermission}
          />

          <SharedUsersList
            doc={doc}
            shares={shares}
            isLoadingShares={isLoadingShares}
            onUpdatePermission={(userId, perm) => updatePermissionMutation.mutate({ userId, permission: perm })}
            onRemoveShare={(userId) => removeShareMutation.mutate(userId)}
            isOwner={isOwner}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
