import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DocumentWithOwner } from "@shared/schema";
import {
  MoreHorizontal,
  Pencil,
  Link as LinkIcon,
  Star,
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
}

export function DocSettingsDropdown({
  doc,
  trigger,
  onOpenSharingModal,
  isSharedWithMe = false,
}: DocSettingsDropdownProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(doc.title);
  const [isProtected, setIsProtected] = useState(false);

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("PUT", `/api/docs/${doc.id}`, { title });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
        refetchType: 'all',
      });
      toast({ title: "Document renamed successfully" });
      setRenameDialogOpen(false);
    },
    onError: (error: any) => {
      if (error?.code === "DUPLICATE_TITLE") {
        toast({
          title: "Name already exists",
          description: `Try: ${error.suggestedTitle}`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Failed to rename document", variant: "destructive" });
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/docs/${doc.id}`);
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
        refetchType: 'all',
      });
      toast({ title: "Document deleted successfully" });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/docs/${doc.id}/duplicate`);
      if (!response.ok) {
        throw new Error("Failed to duplicate");
      }
      return response.json();
    },
    onSuccess: async (newDoc: any) => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
        refetchType: 'all',
      });
      toast({ title: "Document duplicated successfully" });
      navigate(`/docs/${newDoc.id}`);
    },
    onError: () => {
      toast({ title: "Failed to duplicate document", variant: "destructive" });
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      const response = await apiRequest("PATCH", `/api/docs/${doc.id}/favorite`, { isFavorite });
      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
      return response.json();
    },
    onSuccess: async (data: { isFavorite: boolean }) => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
        refetchType: 'all',
      });
      toast({
        title: data.isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    },
    onError: () => {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    },
  });

  // Favorite toggle
  const handleFavoriteToggle = () => {
    const newValue = !(doc.isFavorite ?? false);
    favoriteMutation.mutate(newValue);
    setDropdownOpen(false);
  };

  // Protect toggle - hardcoded UI only for now
  const handleProtectToggle = (checked: boolean) => {
    setIsProtected(checked);
    toast({
      title: checked ? "Document protected" : "Document unprotected",
    });
  };

  // Copy link handler
  const handleCopyLink = () => {
    const url = `${window.location.origin}/docs/${doc.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
    setDropdownOpen(false);
  };

  // Handlers
  const handleRename = () => {
    setNewTitle(doc.title);
    setRenameDialogOpen(true);
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setDropdownOpen(false);
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate();
    setDropdownOpen(false);
  };

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
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className="w-[calc(100vw-2rem)] max-w-[260px] sm:w-52 p-1.5 sm:p-1 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 sm:px-2.5 sm:py-1.5 border-b border-gray-100 dark:border-gray-800 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Doc settings
            </span>
          </div>

          {/* Menu Items */}
          {/* Rename - Only for owner */}
          {!isSharedWithMe && (
            <DropdownMenuItem
              onClick={handleRename}
              className="gap-3 sm:gap-2.5 h-11 sm:h-8 px-3 sm:px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Pencil className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-[15px] sm:text-sm text-gray-700 dark:text-gray-300">Rename</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={handleCopyLink}
            className="gap-3 sm:gap-2.5 h-11 sm:h-8 px-3 sm:px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <LinkIcon className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-[15px] sm:text-sm text-gray-700 dark:text-gray-300">Copy link</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleFavoriteToggle}
            disabled={favoriteMutation.isPending}
            className="gap-3 sm:gap-2.5 h-11 sm:h-8 px-3 sm:px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            {doc.isFavorite ? (
              <Star className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            ) : (
              <Star className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )}
            <span className="text-[15px] sm:text-sm text-gray-700 dark:text-gray-300">
              {favoriteMutation.isPending ? "Updating..." : doc.isFavorite ? "Remove favorite" : "Add to favorites"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            className="gap-3 sm:gap-2.5 h-11 sm:h-8 px-3 sm:px-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:bg-gray-100 dark:focus:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Copy className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-[15px] sm:text-sm text-gray-700 dark:text-gray-300">
              {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
            </span>
          </DropdownMenuItem>

          {/* Delete - Only for owner */}
          {!isSharedWithMe && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="gap-3 sm:gap-2.5 h-11 sm:h-8 px-3 sm:px-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md focus:bg-red-50 dark:focus:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
            >
              <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
              <span className="text-[15px] sm:text-sm text-red-600 dark:text-red-400">Delete</span>
            </DropdownMenuItem>
          )}

          {/* Owner-only options */}
          {!isSharedWithMe && (
            <>
              <DropdownMenuSeparator className="my-1.5 sm:my-1 bg-gray-100 dark:bg-gray-800" />

              {/* Protect Doc Toggle */}
              <div
                className="flex items-center justify-between h-11 sm:h-8 px-3 sm:px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer active:bg-gray-200 dark:active:bg-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center gap-3 sm:gap-2.5">
                  <Lock className={`h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 ${
                    isProtected
                      ? 'text-green-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="text-[15px] sm:text-sm text-gray-700 dark:text-gray-300">Protect Doc</span>
                </div>
                <Switch
                  checked={isProtected}
                  onCheckedChange={handleProtectToggle}
                  className="scale-90 sm:scale-75 data-[state=checked]:bg-green-600"
                />
              </div>

              <DropdownMenuSeparator className="my-1.5 sm:my-1 bg-gray-100 dark:bg-gray-800" />

              {/* Sharing Button */}
              <div className="p-1">
                <button
                  onClick={handleSharingClick}
                  className="w-full h-11 sm:h-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[15px] sm:text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <UsersIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline">Sharing and Permissions</span>
                  <span className="xs:hidden">Share</span>
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
              <Pencil className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span>Rename Document</span>
            </DialogTitle>
            <DialogDescription className="text-[15px] sm:text-sm">
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
                  renameMutation.mutate(newTitle.trim());
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              className="h-11 sm:h-10 text-[15px] sm:text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => renameMutation.mutate(newTitle.trim())}
              disabled={!newTitle.trim() || renameMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-11 sm:h-10 text-[15px] sm:text-sm w-full sm:w-auto"
            >
              {renameMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Renaming...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
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
              <span>Delete Document</span>
            </DialogTitle>
            <DialogDescription className="text-[15px] sm:text-sm">
              Are you sure you want to delete "{doc.title}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-11 sm:h-10 text-[15px] sm:text-sm w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 h-11 sm:h-10 text-[15px] sm:text-sm w-full sm:w-auto"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
