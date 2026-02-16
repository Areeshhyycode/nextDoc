import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DocumentWithOwner } from "@shared/schema";
import { docKeys } from "./docs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Users,
  Clock,
  MoreHorizontal,
  Archive,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getDaysRemaining(deletedAt: Date | string | null): number {
  if (!deletedAt) return 0;
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted);
  expiry.setDate(expiry.getDate() + 30);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getDeletedAgo(deletedAt: Date | string | null): string {
  if (!deletedAt) return "";
  const deleted = new Date(deletedAt);
  const now = new Date();
  const diffMs = now.getTime() - deleted.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatDeletedDate(deletedAt: Date | string | null): string {
  if (!deletedAt) return "";
  const d = new Date(deletedAt);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TrashEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 sm:py-32">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mb-5">
        <Trash2 className="w-9 h-9 sm:w-11 sm:h-11 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        Trash is empty
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-[280px] leading-relaxed">
        Items you delete will appear here and be automatically removed after 30 days.
      </p>
    </div>
  );
}

function TrashDocRow({
  doc,
  onRestore,
  onPermanentDelete,
  isRestoring,
}: {
  doc: DocumentWithOwner;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  isRestoring: boolean;
}) {
  const daysLeft = getDaysRemaining(doc.deletedAt);
  const deletedAgo = getDeletedAgo(doc.deletedAt);
  const deletedDate = formatDeletedDate(doc.deletedAt);

  const iconBg = doc.category === "meeting_notes"
    ? "bg-emerald-50 dark:bg-emerald-500/10"
    : "bg-violet-50 dark:bg-violet-500/10";
  const iconColor = doc.category === "meeting_notes"
    ? "text-emerald-500 dark:text-emerald-400"
    : "text-violet-500 dark:text-violet-400";

  return (
    <>
      {/* ── Mobile card ── */}
      <div className="block md:hidden bg-white dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/40 rounded-lg p-3.5 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {doc.category === "meeting_notes" ? (
              <Users className={`h-4 w-4 ${iconColor}`} />
            ) : (
              <FileText className={`h-4 w-4 ${iconColor}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-tight">
              {doc.title || "Untitled"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {deletedAgo}
              </span>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span
                className={`text-[11px] font-medium ${
                  daysLeft <= 7
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {daysLeft}d left
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/30">
          <button
            className="flex-1 h-8 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 active:bg-gray-150 transition-colors disabled:opacity-50"
            onClick={() => onRestore(doc.id)}
            disabled={isRestoring}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
          <button
            className="flex-1 h-8 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 active:bg-red-150 transition-colors"
            onClick={() => onPermanentDelete(doc.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* ── Desktop row ── */}
      <div className="hidden md:flex items-center h-11 px-4 group hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800/60 last:border-b-0">
        {/* Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {doc.category === "meeting_notes" ? (
              <Users className={`h-3.5 w-3.5 ${iconColor}`} />
            ) : (
              <FileText className={`h-3.5 w-3.5 ${iconColor}`} />
            )}
          </div>
          <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
            {doc.title || "Untitled"}
          </span>
        </div>

        {/* Location */}
        <div className="w-[120px] flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Docs
          </span>
        </div>

        {/* Deleted date */}
        <div className="w-[140px] flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {deletedDate}
          </span>
        </div>

        {/* Time remaining */}
        <div className="w-[100px] flex-shrink-0">
          <span
            className={`text-xs ${
              daysLeft <= 7
                ? "text-red-500 dark:text-red-400 font-medium"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {daysLeft} days
          </span>
        </div>

        {/* Actions — visible on hover */}
        <div className="w-[100px] flex-shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
            onClick={() => onRestore(doc.id)}
            disabled={isRestoring}
            title="Restore"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                title="More actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onRestore(doc.id)}
                disabled={isRestoring}
                className="text-xs gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPermanentDelete(doc.id)}
                className="text-xs gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete forever
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

export default function TrashPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: trashedDocs = [],
    isLoading,
  } = useQuery<DocumentWithOwner[]>({
    queryKey: docKeys.trash(),
    queryFn: async () => {
      const response = await fetch("/api/docs/trash", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch trash");
      return response.json();
    },
    staleTime: 15_000,
  });

  const filteredDocs = searchQuery
    ? trashedDocs.filter((d) =>
        (d.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trashedDocs;

  const restoreMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await apiRequest("POST", `/api/docs/${docId}/restore`);
      if (!response.ok) throw new Error("Failed to restore");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: "all" });
      await queryClient.invalidateQueries({ queryKey: docKeys.lists(), refetchType: "all" });
      toast({ title: "Document restored successfully" });
    },
    onError: () => {
      toast({ title: "Failed to restore document", variant: "destructive" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await apiRequest("DELETE", `/api/docs/${docId}/permanent`);
      if (!response.ok) throw new Error("Failed to permanently delete");
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: "all" });
      toast({ title: "Document permanently deleted" });
      setDeleteDialogOpen(false);
      setSelectedDocId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      for (const doc of trashedDocs) {
        await apiRequest("DELETE", `/api/docs/${doc.id}/permanent`);
      }
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: "all" });
      toast({ title: "Trash emptied successfully" });
      setEmptyTrashDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to empty trash", variant: "destructive" });
    },
  });

  const handleRestore = (docId: string) => {
    restoreMutation.mutate(docId);
  };

  const handlePermanentDelete = (docId: string) => {
    setSelectedDocId(docId);
    setDeleteDialogOpen(true);
  };

  const selectedDoc = trashedDocs.find((d) => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 via-white to-teal-50/20 dark:from-[#0a0f18] dark:via-[#0d1117] dark:to-[#0a0f18]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12 py-2 sm:py-5 lg:py-8">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-[18px] w-[18px] text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Trash
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  Items are automatically deleted after 30 days
                </p>
              </div>
            </div>

            {trashedDocs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmptyTrashDialogOpen(true)}
                className="h-8 text-xs font-medium text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Empty Trash</span>
                <span className="sm:hidden">Empty</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        {trashedDocs.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-colors"
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {filteredDocs.length} {filteredDocs.length === 1 ? "item" : "items"}
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[2.5px] border-gray-200 dark:border-gray-700 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Loading trash...</span>
            </div>
          </div>
        ) : trashedDocs.length === 0 ? (
          <TrashEmptyState />
        ) : (
          <div className="bg-white dark:bg-gray-800/30 border border-gray-200/80 dark:border-gray-700/40 rounded-xl overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden md:flex items-center h-9 px-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-700/40">
              <span className="flex-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Name
              </span>
              <span className="w-[120px] flex-shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Location
              </span>
              <span className="w-[140px] flex-shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Deleted
              </span>
              <span className="w-[100px] flex-shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Expires in
              </span>
              <span className="w-[100px] flex-shrink-0" />
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2 p-2 md:gap-0 md:p-0">
              {filteredDocs.map((doc) => (
                <TrashDocRow
                  key={doc.id}
                  doc={doc}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                  isRestoring={restoreMutation.isPending}
                />
              ))}
            </div>

            {/* No search results */}
            {searchQuery && filteredDocs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No results for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Permanent Delete Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[420px] p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Delete permanently?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  "{selectedDoc?.title || "Untitled"}"
                </span>{" "}
                and all its pages will be permanently deleted. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/40 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-9 text-sm flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDocId && permanentDeleteMutation.mutate(selectedDocId)
              }
              disabled={permanentDeleteMutation.isPending}
              className="h-9 text-sm flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              {permanentDeleteMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete forever"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Empty Trash Dialog ── */}
      <Dialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[420px] p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Empty trash?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                All {trashedDocs.length} {trashedDocs.length === 1 ? "item" : "items"} will be permanently deleted. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/40 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setEmptyTrashDialogOpen(false)}
              className="h-9 text-sm flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => emptyTrashMutation.mutate()}
              disabled={emptyTrashMutation.isPending}
              className="h-9 text-sm flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              {emptyTrashMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                  Emptying...
                </>
              ) : (
                "Empty trash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
