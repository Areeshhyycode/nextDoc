import { useState } from "react";
import { Link } from "wouter";
import { Plus, FileText, Users, Users as UsersIcon, X, Mail, Star } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import { DocSettingsDropdown } from "./doc-settings-dropdown";

interface DocumentsTableProps {
  documents: DocumentWithOwner[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-visible">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-3 px-4 lg:px-6 py-2.5 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
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
  const [showSharingPopup, setShowSharingPopup] = useState(false);

  return (
    <>
      {/* Mobile Layout */}
      <div
        className="md:hidden flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group relative"
        data-testid={`doc-row-mobile-${doc.id}`}
      >
        <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />

        {/* Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          doc.category === 'meeting_notes'
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          {doc.category === 'meeting_notes' ? (
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {doc.title || 'Untitled'}
            </span>
            {doc.isFavorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {doc.owner?.profilePicture ? (
              <img
                src={doc.owner.profilePicture}
                alt={doc.owner.displayName}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[7px] font-medium">
                {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {formatRelativeTime(doc.createdAt)}
            </span>
          </div>
        </div>

        {/* Sharing Icon */}
        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSharingPopup(!showSharingPopup);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>

        {/* Actions - Always visible on mobile */}
        <div className="relative z-10 flex-shrink-0">
          <DocSettingsDropdown
            doc={doc}
            onOpenSharingModal={() => setShowSharingPopup(true)}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-3 px-4 lg:px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer items-center group relative"
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
          {wasUpdated(doc.createdAt, doc.updatedAt) ? formatRelativeTime(doc.updatedAt) : '—'}
        </div>

        {/* Date viewed - Hidden on tablet */}
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
          {doc.lastViewedAt ? formatRelativeTime(doc.lastViewedAt) : '—'}
        </div>

        {/* Sharing - with popup */}
        <div className="relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSharingPopup(!showSharingPopup);
            }}
            className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-1 transition-colors text-sm text-gray-500 dark:text-gray-400"
          >
            <UsersIcon className="h-4 w-4 flex-shrink-0" />
          </button>

          {/* Sharing Popup */}
          {showSharingPopup && doc.owner && (
            <div
              className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowSharingPopup(false)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sharing & Permissions</h4>

              {/* Owner section */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Owner</p>
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  {doc.owner.profilePicture ? (
                    <img
                      src={doc.owner.profilePicture}
                      alt={doc.owner.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {doc.owner.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.owner.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.owner.email}</p>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                    Owner
                  </span>
                </div>
              </div>

              {/* Invite button */}
              <button className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Invite People
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end relative z-10">
          <DocSettingsDropdown
            doc={doc}
            onOpenSharingModal={() => setShowSharingPopup(true)}
          />
        </div>
      </div>
    </>
  );
}
