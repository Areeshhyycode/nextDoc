import { memo } from "react";
import { Users as UsersIcon, Lock, UserCheck } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";

export const SharingStatusBadge = memo(function SharingStatusBadge({
  doc,
  compact = false,
  isSharedWithMe = false
}: {
  doc: DocumentWithOwner;
  compact?: boolean;
  isSharedWithMe?: boolean;
}) {
  const isShared = doc.isShared;
  const shareCount = doc.shareCount || 0;

  if (isSharedWithMe) {
    return (
      <div className="flex items-center gap-1.5">
        <UserCheck className="h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0" />
        {!compact && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 truncate">
            Shared with me
          </span>
        )}
      </div>
    );
  }

  if (isShared) {
    return (
      <div className="flex items-center gap-1.5">
        <UsersIcon className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400 flex-shrink-0" />
        {!compact && (
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 truncate">
            {shareCount > 0 ? `Shared with ${shareCount}` : 'Shared'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Lock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      {!compact && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Private</span>
      )}
    </div>
  );
});
