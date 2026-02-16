import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, X, ChevronDown, RotateCcw, Clock, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { useDocumentVersions, useRestoreVersion } from "@/components/docs/editor/use-document/use-document-versions";
import type { DocumentVersionWithCreator } from "@shared/schema";

interface VersionHistoryPanelProps {
  documentId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  canEdit: boolean;
}

export function VersionHistoryPanel({ documentId, isOpen, onToggle, canEdit }: VersionHistoryPanelProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const { versions, totalVersions, isLoading } = useDocumentVersions(documentId, isOpen);
  const restoreMutation = useRestoreVersion(documentId);

  // Close panel on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onToggle]);

  // Reset selection when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVersionId(null);
    }
  }, [isOpen]);

  const formatVersionDate = (date: Date) => {
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  // Avatar color palette
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Group versions by date
  const groupVersionsByDate = (versions: DocumentVersionWithCreator[]) => {
    const groups: { label: string; versions: DocumentVersionWithCreator[] }[] = [];
    const groupMap = new Map<string, DocumentVersionWithCreator[]>();

    versions.forEach((version) => {
      const date = version.createdAt ? new Date(version.createdAt) : new Date();
      let label: string;
      if (isToday(date)) label = 'Today';
      else if (isYesterday(date)) label = 'Yesterday';
      else label = format(date, 'MMM d, yyyy');

      if (!groupMap.has(label)) {
        groupMap.set(label, []);
      }
      groupMap.get(label)!.push(version);
    });

    groupMap.forEach((versions, label) => {
      groups.push({ label, versions });
    });

    return groups;
  };

  const handleRestore = async (versionId: string) => {
    if (!window.confirm("Restore this version? Your current content will be saved as a snapshot first.")) return;
    setIsRestoring(true);
    try {
      await restoreMutation.mutateAsync(versionId);
      setSelectedVersionId(null);
      onToggle();
    } finally {
      setIsRestoring(false);
    }
  };

  const versionGroups = groupVersionsByDate(versions);

  const VersionItem = ({ version }: { version: DocumentVersionWithCreator }) => {
    const isSelected = selectedVersionId === version.id;
    const isCurrentUser = version.createdBy === user?.id;

    return (
      <button
        onClick={() => setSelectedVersionId(isSelected ? null : version.id)}
        className={cn(
          "w-full text-left rounded-xl transition-all duration-200 p-3 sm:p-3.5",
          isSelected
            ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 shadow-sm"
            : "bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600/60 hover:shadow-sm"
        )}
      >
        <div className="flex items-start gap-2.5">
          {/* Version number badge */}
          <div className={cn(
            "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold",
            isSelected
              ? "bg-teal-100 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400"
              : "bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400"
          )}>
            v{version.versionNumber}
          </div>

          <div className="flex-1 min-w-0">
            {/* Creator + time row */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0",
                getAvatarColor(version.createdBy)
              )}>
                {version.creator?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate">
                {version.creator?.displayName || 'Unknown'}
              </span>
              {isCurrentUser && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">you</span>
              )}
            </div>

            {/* Time + word count row */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {version.createdAt ? formatVersionDate(new Date(version.createdAt)) : 'Just now'}
              </span>
              {version.wordCount != null && version.wordCount > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {version.wordCount.toLocaleString()} words
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              {version.title}
            </p>
          </div>
        </div>

        {/* Restore button when selected */}
        {isSelected && canEdit && (
          <div className="mt-3 pt-3 border-t border-teal-200/60 dark:border-teal-800/40 flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(version.id);
              }}
              disabled={isRestoring}
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 flex-1",
                "bg-teal-600 hover:bg-teal-700 text-white shadow-sm",
              )}
            >
              {isRestoring ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Restoring...
                </span>
              ) : (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Restore this version
                </>
              )}
            </Button>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[55] transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "fixed flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        // Mobile: full-screen overlay
        "inset-0 z-[60] md:z-50",
        // Desktop: right sidebar
        "md:right-0 md:top-0 md:left-auto md:bottom-auto md:h-full md:w-[380px]",
        // Surface
        "bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-850 md:border-l md:border-gray-200/80 md:dark:border-gray-700/60 md:shadow-xl",
        // Animations
        isOpen
          ? "translate-y-0 md:translate-y-0 md:translate-x-0 opacity-100"
          : "translate-y-full md:translate-y-0 md:translate-x-full pointer-events-none opacity-0 md:opacity-100"
      )}
      data-testid="version-history-panel"
      >
        {/* ─── Header ─── */}
        <div className="bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent">
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-2.5 pb-0 md:hidden">
            <div className="w-9 h-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Version History
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  {totalVersions} version{totalVersions !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all"
              data-testid="button-close-versions"
            >
              <ChevronDown className="h-5 w-5 md:hidden" />
              <X className="h-4 w-4 hidden md:block" />
            </button>
          </div>

          {/* Separator */}
          <div className="border-b border-gray-200/80 dark:border-gray-700/50" />
        </div>

        {/* ─── Version list ─── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="h-6 w-6 border-2 border-gray-200 dark:border-gray-700 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-3">Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                No versions yet
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 text-center max-w-[200px]">
                Versions are saved automatically as you edit the document
              </p>
            </div>
          ) : (
            versionGroups.map((group) => (
              <div key={group.label}>
                {/* Date group header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-700/40" />
                </div>
                <div className="space-y-2">
                  {group.versions.map((version) => (
                    <VersionItem key={version.id} version={version} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── Footer info ─── */}
        {versions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200/80 dark:border-gray-700/50 px-4 py-2.5 sm:px-5 sm:py-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:pb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              <FileText className="h-3 w-3" />
              <span>Versions are saved automatically on every edit</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
