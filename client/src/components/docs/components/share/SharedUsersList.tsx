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
}

export function SharedUsersList({
  doc,
  shares,
  isLoadingShares,
  onUpdatePermission,
  onRemoveShare,
}: SharedUsersListProps) {
  return (
    <>
      {/* Owner Section */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</p>
        <div className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg">
          {doc.owner?.profilePicture ? (
            <img src={doc.owner.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className={`w-9 h-9 rounded-full ${getAvatarColor(doc.owner?.displayName || 'U')} flex items-center justify-center text-white text-sm font-medium`}>
              {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{doc.owner?.displayName || 'Unknown'}</p>
          </div>
          <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
            Owner
          </span>
        </div>
      </div>

      {/* Shared With Section */}
      {isLoadingShares ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shared with</p>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[#444]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#444] rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : shares.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Shared with ({shares.length})
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg group"
              >
                {share.user?.profilePicture ? (
                  <img src={share.user.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className={`w-9 h-9 rounded-full ${getAvatarColor(share.user?.displayName || 'U')} flex items-center justify-center text-white text-sm font-medium`}>
                    {share.user?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{share.user?.displayName || 'Unknown'}</p>
                </div>
                <Select
                  value={share.permission}
                  onValueChange={(val: PermissionType) => {
                    onUpdatePermission(share.userId, val);
                  }}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs bg-transparent border-[#444] text-gray-300 hover:border-[#555]">
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
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
