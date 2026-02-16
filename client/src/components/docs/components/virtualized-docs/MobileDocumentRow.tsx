import { useState, memo } from "react";
import { Link } from "wouter";
import { FileText, Users, Star, Pin } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime } from "@/lib/date-utils";
import { DocSettingsDropdown } from "../doc-settings-dropdown";
import { ShareDocumentModal } from "../share-document-modal";
import { useAuth } from "@/hooks/useAuth";
import { SharingStatusBadge } from "./SharingStatusBadge";
import { DuplicateNameBadge } from "../duplicate-name-badge";

export const MobileDocumentRow = memo(function MobileDocumentRow({
  doc,
  style,
  isDuplicate
}: {
  doc: DocumentWithOwner;
  style: React.CSSProperties;
  isDuplicate?: boolean;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProtected, setIsProtected] = useState(doc.isProtected ?? false);
  const { user } = useAuth();
  const isSharedWithMe = user?.id !== doc.ownerId;
  const canShare = user?.id === doc.ownerId;

  return (
    <>
      <div
        style={style}
        className="flex flex-col gap-0 px-3 sm:px-4 py-3 sm:py-4 active:bg-gray-50 dark:active:bg-gray-800/50 active:scale-[0.99] transition-all duration-150 cursor-pointer group relative border-b last:border-b-0 border-gray-100 dark:border-gray-700/30 touch-manipulation"
        data-testid={`doc-row-mobile-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-700/50 ${
            doc.category === 'meeting_notes'
              ? 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20'
              : 'bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-900/20'
          }`}>
            {doc.category === 'meeting_notes' ? (
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            ) : (
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 dark:text-teal-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <span className="text-[12px] sm:text-[13px] font-extrabold text-gray-900 dark:text-white truncate leading-tight">
                {doc.title || 'Untitled'}
              </span>
              {isDuplicate && <DuplicateNameBadge compact />}
              {doc.isPinned && (
                <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-500 fill-teal-500 flex-shrink-0 rotate-45" />
              )}
              {doc.isFavorite && (
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
              {isProtected && (
                <div className="relative group/shield flex-shrink-0">
                  <img
                    src="/pngtree-removebg-preview.png"
                    alt="Protected Doc"
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-1 sm:gap-1.5">
                {doc.owner?.profilePicture ? (
                  <img
                    src={doc.owner.profilePicture}
                    alt={doc.owner.displayName}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover ring-1 sm:ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white text-[7px] sm:text-[8px] font-bold shadow-sm" aria-hidden="true">
                    {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-none">{doc.owner?.displayName || 'Unknown'}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">&bull;</span>
              <span className="text-gray-500 dark:text-gray-400 truncate">{formatRelativeTime(doc.createdAt)}</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canShare) setShowShareModal(true);
              }}
              className={`p-2 sm:p-2.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation min-h-[36px] sm:min-h-[44px] flex items-center justify-center ${canShare ? 'active:scale-95' : 'cursor-default'}`}
              aria-label={canShare ? "Share document" : "Sharing status"}
            >
              <SharingStatusBadge doc={doc} compact isSharedWithMe={isSharedWithMe} />
            </button>
            <DocSettingsDropdown
              doc={doc}
              onOpenSharingModal={canShare ? () => setShowShareModal(true) : undefined}
              isSharedWithMe={isSharedWithMe}
              isProtected={isProtected}
              onProtectToggle={setIsProtected}
            />
          </div>
        </div>
      </div>

      {canShare && (
        <ShareDocumentModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          document={doc}
        />
      )}
    </>
  );
});
