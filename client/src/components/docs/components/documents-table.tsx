import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, MoreHorizontal, Pencil, Link as LinkIcon, Star, FolderInput, Copy, LayoutTemplate, Archive, Trash2, Lock, Users as UsersIcon, X, Mail } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { formatRelativeTime, wasUpdated } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface DocumentsTableProps {
  documents: DocumentWithOwner[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 lg:px-8 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
        <div className="col-span-4 lg:col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          Name
        </div>
        <div className="col-span-2 lg:col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Created By
        </div>
        <div className="hidden lg:block col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Create date
        </div>
        <div className="hidden lg:block col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Update date
        </div>
        <div className="col-span-4 lg:col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Sharing
        </div>
        <div className="col-span-1 flex justify-end">
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
    <div
      className="grid grid-cols-12 gap-4 px-6 lg:px-8 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer items-center group relative"
      data-testid={`doc-row-${doc.id}`}
    >
      <Link href={`/docs/${doc.id}`} className="absolute inset-0 z-0" />
        {/* Name */}
        <div className="col-span-4 lg:col-span-3 flex items-center gap-3 min-w-0">
          <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
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
        </div>

        {/* Created By - with avatar and popup */}
        <div className="col-span-2 lg:col-span-2 relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowOwnerPopup(!showOwnerPopup);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 transition-colors"
          >
            {doc.owner?.profilePicture ? (
              <img
                src={doc.owner.profilePicture}
                alt={doc.owner.displayName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate hidden lg:block max-w-[100px]">
              {doc.owner?.displayName || 'Unknown'}
            </span>
          </button>
          <OwnerInfoPopup
            owner={doc.owner}
            isOpen={showOwnerPopup}
            onClose={() => setShowOwnerPopup(false)}
          />
        </div>

        {/* Create date - Hidden on mobile */}
        <div className="hidden lg:block col-span-2 text-sm text-gray-500 dark:text-gray-400">
          {formatRelativeTime(doc.createdAt)}
        </div>

        {/* Update date - Hidden on mobile, shows only if updated */}
        <div className="hidden lg:block col-span-2 text-sm text-gray-500 dark:text-gray-400">
          {wasUpdated(doc.createdAt, doc.updatedAt) ? formatRelativeTime(doc.updatedAt) : '—'}
        </div>

        {/* Sharing - with popup */}
        <div className="col-span-4 lg:col-span-2 relative z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSharingPopup(!showSharingPopup);
            }}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 transition-colors text-sm text-gray-500 dark:text-gray-400"
          >
            <UsersIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Only owner</span>
          </button>

          {/* Sharing Popup */}
          {showSharingPopup && doc.owner && (
            <div
              className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[300px]"
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
        <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-52 py-2 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-3 pb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Doc settings</span>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <Pencil className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rename</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Copy link</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <Star className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Favorite</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50 justify-between">
                <div className="flex items-center gap-3">
                  <FolderInput className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Move to</span>
                </div>
                <span className="text-gray-400 text-sm">›</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <Copy className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Duplicate</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50 justify-between">
                <div className="flex items-center gap-3">
                  <LayoutTemplate className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Templates</span>
                </div>
                <span className="text-gray-400 text-sm">›</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <Archive className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Archive</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 h-8 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm mx-1 focus:bg-gray-50">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Delete</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Protect Doc */}
              <div className="flex items-center justify-between h-8 px-3 mx-1">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Protect Doc</span>
                </div>
                <Switch className="scale-75" />
              </div>

              {/* Sharing Button */}
              <div className="px-2 pt-2">
                <button className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Sharing and Permissions
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );
}
