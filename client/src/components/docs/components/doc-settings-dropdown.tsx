import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useDocumentMutations } from "@/hooks/use-document-mutations";
import type { DocumentWithOwner } from "@shared/schema";
import {
  MoreHorizontal,
  Pencil,
  Link as LinkIcon,
  Star,
  Pin,
  Copy,
  Trash2,
  Lock,
  Users as UsersIcon,
  AlertTriangle,
  Check,
} from "lucide-react";

interface DocSettingsDropdownProps {
  doc: DocumentWithOwner;
  trigger?: React.ReactNode;
  onOpenSharingModal?: () => void;
  isSharedWithMe?: boolean;
  isProtected?: boolean;
  onProtectToggle?: (isProtected: boolean) => void;
}

export function DocSettingsDropdown({
  doc,
  trigger,
  onOpenSharingModal,
  isSharedWithMe = false,
  isProtected = false,
  onProtectToggle,
}: DocSettingsDropdownProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(doc.title);

  // Use centralized mutations hook
  const mutations = useDocumentMutations({
    docId: doc.id,
    onDeleteSuccess: () => setDeleteDialogOpen(false),
    onDuplicateSuccess: (newDocId) => navigate(`/docs/${newDocId}`),
  });

  // Wrap rename mutation to close dialog on success
  const handleRenameSubmit = useCallback((title: string) => {
    mutations.rename.mutate(title, {
      onSuccess: () => setRenameDialogOpen(false),
    });
  }, [mutations.rename]);

  // Favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    const newValue = !(doc.isFavorite ?? false);
    mutations.favorite.mutate(newValue);
    setDropdownOpen(false);
  }, [doc.isFavorite, mutations.favorite]);

  // Pin toggle
  const handlePinToggle = useCallback(() => {
    const newValue = !(doc.isPinned ?? false);
    mutations.pin.mutate(newValue);
    setDropdownOpen(false);
  }, [doc.isPinned, mutations.pin]);

  // Protect toggle - hardcoded UI only for now
  const handleProtectToggle = useCallback((checked: boolean) => {
    onProtectToggle?.(checked);
    toast({
      title: checked ? "Document protected" : "Document unprotected",
    });
  }, [toast, onProtectToggle]);

  // Copy link handler
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/docs/${doc.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
    setDropdownOpen(false);
  }, [doc.id, toast]);

  // Handlers
  const handleRename = useCallback(() => {
    setNewTitle(doc.title);
    setRenameDialogOpen(true);
    setDropdownOpen(false);
  }, [doc.title]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    setDropdownOpen(false);
  }, []);

  const handleDuplicate = useCallback(() => {
    mutations.duplicate.mutate();
    setDropdownOpen(false);
  }, [mutations.duplicate]);

  const handleSharingClick = () => {
    setDropdownOpen(false);
    onOpenSharingModal?.();
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Document options"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className="w-48 sm:w-52 p-1 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 border-b border-gray-100 dark:border-gray-800 mb-0.5">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Doc settings
            </span>
          </div>

          {/* Menu Items */}
          {/* Rename - Only for owner */}
          {!isSharedWithMe && (
            <DropdownMenuItem
              onClick={handleRename}
              className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Rename</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={handleCopyLink}
            className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <LinkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Copy link</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleFavoriteToggle}
            disabled={mutations.favorite.isPending}
            className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            {doc.isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <Star className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {mutations.favorite.isPending ? "Updating..." : doc.isFavorite ? "Remove favorite" : "Add to favorites"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handlePinToggle}
            disabled={mutations.pin.isPending}
            className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            {doc.isPinned ? (
              <Pin className="h-4 w-4 text-teal-500 fill-teal-500 flex-shrink-0 rotate-45" aria-hidden="true" />
            ) : (
              <Pin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {mutations.pin.isPending ? "Updating..." : doc.isPinned ? "Unpin" : "Pin to top"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={mutations.duplicate.isPending}
            className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {mutations.duplicate.isPending ? "Duplicating..." : "Duplicate"}
            </span>
          </DropdownMenuItem>

          {/* Delete - Only for owner */}
          {!isSharedWithMe && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="gap-2 h-8 px-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md focus:bg-red-50 dark:focus:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">Delete</span>
            </DropdownMenuItem>
          )}

          {/* Owner-only options */}
          {!isSharedWithMe && (
            <>
              <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

              {/* Protect Doc Toggle */}
              <div
                className="flex items-center justify-between h-8 px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer active:bg-gray-200 dark:active:bg-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {isProtected ? (
                    <div className="relative group/shield">
                      <img
                        src="/pngtree-removebg-preview.png"
                        alt="Protected Doc"
                        className="h-4 w-4 flex-shrink-0"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover/shield:opacity-100 group-hover/shield:visible transition-all duration-200 pointer-events-none z-50">
                        Protected Doc
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </div>
                    </div>
                  ) : (
                    <Lock className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Protect Doc</span>
                </div>
                <Switch
                  checked={isProtected}
                  onCheckedChange={handleProtectToggle}
                  className="scale-75 data-[state=checked]:bg-green-600"
                  onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </div>

            </>
          )}

          {/* Sharing Button - Available for both owner and shared-with-me users */}
          {onOpenSharingModal && (
            <>
              <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

              <div className="p-1">
                <button
                  onClick={handleSharingClick}
                  className="w-full h-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UsersIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Share</span>
                </button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[400px] sm:max-w-md p-5 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-base">
              <Pencil className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <span>Rename Document</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Enter a new name for your document.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document name"
              className="h-12 sm:h-11 text-[16px] sm:text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  handleRenameSubmit(newTitle.trim());
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              className="h-11 sm:h-10 text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRenameSubmit(newTitle.trim())}
              disabled={!newTitle.trim() || mutations.rename.isPending}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 h-11 sm:h-10 text-sm w-full sm:w-auto"
            >
              {mutations.rename.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
                  Renaming...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                  Rename
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[400px] sm:max-w-md p-5 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2.5 text-red-600 text-lg sm:text-base">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>Move to Trash</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to move "{doc.title}" to trash? You can restore it from Trash within 30 days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-11 sm:h-10 text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => mutations.delete.mutate()}
              disabled={mutations.delete.isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 h-11 sm:h-10 text-sm w-full sm:w-auto"
            >
              {mutations.delete.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
                  Moving...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Move to Trash
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
