import { useState, memo } from "react";
import { Link } from "wouter";
import { FileText, Users, Star, Pin } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import { DocSettingsDropdown } from "../doc-settings-dropdown";
import { ShareDocumentModal } from "../share-document-modal";
import { useAuth } from "@/hooks/useAuth";
import { SharingStatusBadge } from "./SharingStatusBadge";
import { OwnerInfoPopup } from "./OwnerInfoPopup";
import { DuplicateNameBadge } from "../duplicate-name-badge";

export const DesktopDocumentRow = memo(function DesktopDocumentRow({
  doc,
  style,
  isDuplicate
}: {
  doc: DocumentWithOwner;
  style: React.CSSProperties;
  isDuplicate?: boolean;
}) {
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProtected, setIsProtected] = useState(doc.isProtected ?? false);
  const { user } = useAuth();
  const isSharedWithMe = user?.id !== doc.ownerId;
  const canShare = user?.id === doc.ownerId;

  return (
    <>
      <div
        style={style}
        className="grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3.5 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent dark:hover:from-gray-800/40 dark:hover:to-transparent transition-all duration-200 cursor-pointer items-center group relative border-b last:border-b-0 border-gray-100/50 dark:border-gray-700/20"
        data-testid={`doc-row-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            doc.category === 'meeting_notes'
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-teal-100 dark:bg-teal-900/30'
          }`}>
            {doc.category === 'meeting_notes' ? (
              <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            )}
          </div>
          <span className="text-sm text-gray-900 dark:text-white truncate">
            {doc.title || 'Untitled'}
          </span>
          {isDuplicate && <DuplicateNameBadge />}
          {doc.isPinned && (
            <Pin className="h-4 w-4 text-teal-500 fill-teal-500 flex-shrink-0 rotate-45" />
          )}
          {doc.isFavorite && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
          {isProtected && (
            <div className="relative group/shield flex-shrink-0" style={{ zIndex: 5 }}>
              <img
                src="/pngtree-removebg-preview.png"
                alt="Protected Doc"
                className="h-[18px] w-[18px] object-contain"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 invisible group-hover/shield:opacity-100 group-hover/shield:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
                Protected Doc
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </div>
            </div>
          )}
        </div>

        {/* Created By */}
        <div className="relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowOwnerPopup(!showOwnerPopup);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-1 transition-colors"
          >
            {doc.owner?.profilePicture ? (
              <img
                src={doc.owner.profilePicture}
                alt={doc.owner.displayName}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0" aria-hidden="true">
                {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
              {doc.owner?.displayName || 'Unknown'}
            </span>
          </button>
          <OwnerInfoPopup
            owner={doc.owner}
            isOpen={showOwnerPopup}
            onClose={() => setShowOwnerPopup(false)}
          />
        </div>

        {/* Create date */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {formatRelativeTime(doc.createdAt)}
        </div>

        {/* Update date */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {wasUpdated(doc.createdAt, doc.updatedAt) ? (
            <div className="flex flex-col">
              <span>{formatRelativeTime(doc.updatedAt)}</span>
              {doc.lastUpdater && doc.lastUpdater.id !== doc.ownerId && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  by {doc.lastUpdater.displayName}
                </span>
              )}
            </div>
          ) : '—'}
        </div>

        {/* Date viewed */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {doc.lastViewedAt ? formatRelativeTime(doc.lastViewedAt) : '—'}
        </div>

        {/* Sharing */}
        <div className="relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canShare) setShowShareModal(true);
            }}
            className={`flex items-center rounded-md p-1.5 sm:p-1 transition-all ${canShare ? 'hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95' : 'cursor-default'}`}
            aria-label={canShare ? "Share document" : "Sharing status"}
          >
            <SharingStatusBadge doc={doc} isSharedWithMe={isSharedWithMe} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end relative z-10">
          <DocSettingsDropdown
            doc={doc}
            onOpenSharingModal={canShare ? () => setShowShareModal(true) : undefined}
            isSharedWithMe={isSharedWithMe}
            isProtected={isProtected}
            onProtectToggle={setIsProtected}
          />
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
