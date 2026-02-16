import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { DocumentShare, PermissionType } from "./types";
import { PERMISSION_CONFIG, getAvatarColor } from "./types";
import type { DocumentWithOwner } from "@shared/schema";

interface SharedUsersListProps {
  doc: DocumentWithOwner;
  shares: DocumentShare[];
  isLoadingShares: boolean;
  onUpdatePermission: (userId: string, permission: PermissionType) => void;
  onRemoveShare: (userId: string) => void;
  isOwner?: boolean;
}

export function SharedUsersList({
  doc,
  shares,
  isLoadingShares,
  onUpdatePermission,
  onRemoveShare,
  isOwner = true,
}: SharedUsersListProps) {
  return (
    <>
      {/* Owner Section */}
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</p>
        <div className="flex items-center gap-2.5 p-2 sm:p-3 bg-[#2a2a2a] rounded-lg">
          {doc.owner?.profilePicture ? (
            <img src={doc.owner.profilePicture} alt="" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${getAvatarColor(doc.owner?.displayName || 'U')} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
              {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-white truncate">{doc.owner?.displayName || 'Unknown'}</p>
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
            Owner
          </span>
        </div>
      </div>

      {/* Shared With Section */}
      {isLoadingShares ? (
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">Shared with</p>
          <div className="space-y-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 sm:p-3 bg-[#2a2a2a] rounded-lg animate-pulse">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#444]" />
                <div className="flex-1">
                  <div className="h-3.5 bg-[#444] rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : shares.length > 0 ? (
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
            Shared with ({shares.length})
          </p>
          <div className="space-y-1.5 max-h-[150px] sm:max-h-[200px] overflow-y-auto">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-2 p-2 sm:p-3 bg-[#2a2a2a] rounded-lg group"
              >
                {share.user?.profilePicture ? (
                  <img src={share.user.profilePicture} alt="" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${getAvatarColor(share.user?.displayName || 'U')} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                    {share.user?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{share.user?.displayName || 'Unknown'}</p>
                </div>
                {isOwner ? (
                  <>
                    <Select
                      value={share.permission}
                      onValueChange={(val: PermissionType) => {
                        onUpdatePermission(share.userId, val);
                      }}
                    >
                      <SelectTrigger className="w-[80px] sm:w-[110px] h-6 sm:h-8 text-[10px] sm:text-xs bg-transparent border-[#444] text-gray-300 hover:border-[#555] rounded">
                        <SelectValue>{PERMISSION_CONFIG[share.permission].shortLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-[#444]">
                        {(Object.entries(PERMISSION_CONFIG) as [PermissionType, { label: string; shortLabel: string }][]).map(
                          ([value, { label }]) => (
                            <SelectItem key={value} value={value} className="text-white hover:bg-[#333] cursor-pointer text-xs">
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => onRemoveShare(share.userId)}
                      className="p-1 sm:p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded sm:opacity-0 sm:group-hover:opacity-100 transition-all touch-manipulation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] sm:text-xs text-gray-400 px-2 py-0.5">
                    {PERMISSION_CONFIG[share.permission].shortLabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
