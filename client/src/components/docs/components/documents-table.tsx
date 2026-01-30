import { useState } from "react";
import { Link } from "wouter";
import { Plus, FileText, Users, Users as UsersIcon, X, Mail, Star, Lock, UserCheck } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import { DocSettingsDropdown } from "./doc-settings-dropdown";
import { ShareDocumentModal } from "./share-document-modal";
import { useAuth } from "@/hooks/useAuth";

interface DocumentsTableProps {
  documents: DocumentWithOwner[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
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
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

interface DocumentRowProps {
  doc: DocumentWithOwner;
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
        <UsersIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        {!compact && (
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
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

function DocumentRow({ doc }: DocumentRowProps) {
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();

  // Check if this document is shared with me (I'm not the owner)
  const isSharedWithMe = user?.id !== doc.ownerId;
  // Only owner can share the document
  const canShare = user?.id === doc.ownerId;

  return (
    <>
      {/* Mobile Layout */}
      <div
        className="md:hidden flex flex-col gap-0 px-4 py-4 active:bg-gray-50 dark:active:bg-gray-800/50 active:scale-[0.98] transition-all duration-150 cursor-pointer group relative border-b last:border-b-0 border-gray-100 dark:border-gray-700/30 touch-manipulation"
        data-testid={`doc-row-mobile-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Top Row: Icon, Title, Actions */}
        <div className="flex items-start gap-3">
          {/* Icon */}
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

          {/* Title & Meta */}
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
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                    {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="font-bold text-gray-700 dark:text-gray-300">{doc.owner?.displayName || 'Unknown'}</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400">{formatRelativeTime(doc.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canShare) setShowShareModal(true);
              }}
              className={`p-2.5 sm:p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center ${canShare ? 'active:scale-95' : 'cursor-default'}`}
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

      {/* Desktop Layout */}
      <div
        className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3.5 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent dark:hover:from-gray-800/40 dark:hover:to-transparent transition-all duration-200 cursor-pointer items-center group relative border-b last:border-b-0 border-gray-100/50 dark:border-gray-700/20"
        data-testid={`doc-row-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            doc.category === 'meeting_notes'
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {doc.category === 'meeting_notes' ? (
              <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <span className="text-sm text-gray-900 dark:text-white truncate">
            {doc.title || 'Untitled'}
          </span>
          {doc.isFavorite && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
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
          />
        </div>
      </div>

      {/* Share Document Modal - Only render for owner */}
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
