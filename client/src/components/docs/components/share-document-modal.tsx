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

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithOwner;
}

export function ShareDocumentModal({ isOpen, onClose, document: doc }: ShareDocumentModalProps) {
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

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, setSearchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[440px] max-w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden bg-[#1e1e1e] border-[#333] rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-[15px] font-semibold text-white">
              Share "{doc.title}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333] rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <PublicLinkSection
            publicLinkEnabled={publicLinkEnabled}
            publicLink={publicLink}
            onToggle={(checked) => togglePublicLinkMutation.mutate(checked)}
            isToggling={togglePublicLinkMutation.isPending}
          />

          <ExportDropdown doc={doc} />

          <UserSearchSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            permission={permission}
            onPermissionChange={setPermission}
            availableUsers={availableUsers}
            isSearching={isSearching}
            isPending={shareMutation.isPending}
            onSelectUser={(user) => shareMutation.mutate({ userId: user.id, permission })}
          />

          <SharedUsersList
            doc={doc}
            shares={shares}
            isLoadingShares={isLoadingShares}
            onUpdatePermission={(userId, perm) => updatePermissionMutation.mutate({ userId, permission: perm })}
            onRemoveShare={(userId) => removeShareMutation.mutate(userId)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
