import { useState } from "react";
import { Link } from "wouter";
import { Plus, FileText, Users, Users as UsersIcon, X, Mail, Star, Pin, Lock, UserCheck } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import { DocSettingsDropdown } from "./doc-settings-dropdown";
import { ShareDocumentModal } from "./share-document-modal";
import { useAuth } from "@/hooks/useAuth";
import { DuplicateNameBadge } from "./duplicate-name-badge";

interface DocumentsTableProps {
  documents: DocumentWithOwner[];
  duplicateDocIds?: Set<string>;
}

export function DocumentsTable({ documents, duplicateDocIds }: DocumentsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-xl border-2 border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-lg shadow-gray-100/50 dark:shadow-gray-900/50">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3 bg-gradient-to-b from-gray-50 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-800/40 border-b-2 border-gray-200/60 dark:border-gray-700/50">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Name
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Created By
        </div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">
          Create date
        </div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">
          Update date
        </div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">
          Date viewed
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Sharing
        </div>
        <div className="flex justify-end">
          <button className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/30">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} isDuplicate={duplicateDocIds?.has(doc.id) ?? false} />
        ))}
      </div>
    </div>
  );
}

interface DocumentRowProps {
  doc: DocumentWithOwner;
  isDuplicate?: boolean;
}

// Sharing status badge component
function SharingStatusBadge({ doc, compact = false, isSharedWithMe = false }: { doc: DocumentWithOwner; compact?: boolean; isSharedWithMe?: boolean }) {
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
}

// Owner info popup component
function OwnerInfoPopup({
  owner,
  isOpen,
  onClose
}: {
  owner: DocumentWithOwner['owner'];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !owner) return null;

  return (
    <div
      className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Owner info */}
      <div className="flex items-center gap-3 mb-3">
        {owner.profilePicture ? (
          <img
            src={owner.profilePicture}
            alt={owner.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white font-semibold text-lg">
            {owner.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{owner.displayName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Document Owner</p>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-300">{owner.email}</span>
      </div>
    </div>
  );
}

function DocumentRow({ doc, isDuplicate }: DocumentRowProps) {
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProtected, setIsProtected] = useState(doc.isProtected ?? false);
  const { user } = useAuth();

  // Check if this document is shared with me (I'm not the owner)
  const isSharedWithMe = user?.id !== doc.ownerId;
  // Owner and shared-with-me users can share the document
  const canShare = true;

  return (
    <>
      {/* Mobile Layout */}
      <div
        className="md:hidden flex flex-col gap-0 px-3 sm:px-4 py-3 sm:py-4 active:bg-gray-50 dark:active:bg-gray-800/50 active:scale-[0.99] transition-all duration-150 cursor-pointer group relative border-b last:border-b-0 border-gray-100 dark:border-gray-700/30 touch-manipulation"
        data-testid={`doc-row-mobile-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Top Row: Icon, Title, Actions */}
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Icon */}
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

          {/* Title & Meta */}
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
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white text-[7px] sm:text-[8px] font-bold shadow-sm">
                    {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-none">{doc.owner?.displayName || 'Unknown'}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-gray-500 dark:text-gray-400 truncate">{formatRelativeTime(doc.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canShare) setShowShareModal(true);
              }}
              className={`p-2 sm:p-2.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation min-h-[36px] sm:min-h-[44px] flex items-center justify-center ${canShare ? 'active:scale-95' : 'cursor-default'}`}
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

      {/* Desktop Layout */}
      <div
        className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3.5 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent dark:hover:from-gray-800/40 dark:hover:to-transparent transition-all duration-200 cursor-pointer items-center group relative border-b last:border-b-0 border-gray-100/50 dark:border-gray-700/20"
        data-testid={`doc-row-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Name */}
        <div className="flex items-center gap-2 min-w-0">
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

        {/* Created By - with avatar, name and popup */}
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
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

        {/* Create date - Hidden on tablet */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {formatRelativeTime(doc.createdAt)}
        </div>

        {/* Update date - Hidden on tablet */}
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

        {/* Date viewed - Hidden on tablet */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {doc.lastViewedAt ? formatRelativeTime(doc.lastViewedAt) : '—'}
        </div>

        {/* Sharing - opens modal (only for owner) */}
        <div className="relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canShare) setShowShareModal(true);
            }}
            className={`flex items-center rounded-md p-1.5 sm:p-1 transition-all ${canShare ? 'hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95' : 'cursor-default'}`}
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

      {/* Share Document Modal - Render for owner and shared users */}
      {canShare && (
        <ShareDocumentModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          document={doc}
        />
      )}
    </>
  );
}
