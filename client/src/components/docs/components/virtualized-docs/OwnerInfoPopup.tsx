import { X, Mail } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";

export function OwnerInfoPopup({
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
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        {owner.profilePicture ? (
          <img
            src={owner.profilePicture}
            alt={owner.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white font-semibold text-lg" aria-hidden="true">
            {owner.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{owner.displayName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Document Owner</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
        <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span className="text-sm text-gray-600 dark:text-gray-300">{owner.email}</span>
      </div>
    </div>
  );
}
