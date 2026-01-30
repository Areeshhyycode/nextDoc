import { useState, memo } from "react";
import { Link } from "wouter";
import { FileText, Users, Star } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime } from "@/lib/date-utils";
import { DocSettingsDropdown } from "../doc-settings-dropdown";
import { ShareDocumentModal } from "../share-document-modal";
import { useAuth } from "@/hooks/useAuth";
import { SharingStatusBadge } from "./SharingStatusBadge";

export const MobileDocumentRow = memo(function MobileDocumentRow({
  doc,
  style
}: {
  doc: DocumentWithOwner;
  style: React.CSSProperties;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  const isSharedWithMe = user?.id !== doc.ownerId;
  const canShare = user?.id === doc.ownerId;

  return (
    <>
      <div
        style={style}
        className="flex flex-col gap-0 px-4 py-4 active:bg-gray-50 dark:active:bg-gray-800/50 active:scale-[0.98] transition-all duration-150 cursor-pointer group relative border-b last:border-b-0 border-gray-100 dark:border-gray-700/30 touch-manipulation"
        data-testid={`doc-row-mobile-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-700/50 ${
            doc.category === 'meeting_notes'
              ? 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20'
              : 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20'
          }`}>
            {doc.category === 'meeting_notes' ? (
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[13px] font-extrabold text-gray-900 dark:text-white truncate leading-tight">
                {doc.title || 'Untitled'}
              </span>
              {doc.isFavorite && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                {doc.owner?.profilePicture ? (
                  <img
                    src={doc.owner.profilePicture}
                    alt={doc.owner.displayName}
                    className="w-4 h-4 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm" aria-hidden="true">
                    {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="font-bold text-gray-700 dark:text-gray-300">{doc.owner?.displayName || 'Unknown'}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">&bull;</span>
              <span className="text-gray-500 dark:text-gray-400">{formatRelativeTime(doc.createdAt)}</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canShare) setShowShareModal(true);
              }}
              className={`p-2.5 sm:p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center ${canShare ? 'active:scale-95' : 'cursor-default'}`}
              aria-label={canShare ? "Share document" : "Sharing status"}
            >
              <SharingStatusBadge doc={doc} compact isSharedWithMe={isSharedWithMe} />
            </button>
            <DocSettingsDropdown
              doc={doc}
              onOpenSharingModal={canShare ? () => setShowShareModal(true) : undefined}
              isSharedWithMe={isSharedWithMe}
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
