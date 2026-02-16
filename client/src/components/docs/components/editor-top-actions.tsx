import { Share2, MoreHorizontal, X, Link, Download, FileText, FileCode, FileType, File, FileJson, FileSpreadsheet, Pencil, Copy, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShareDocumentModal } from "./share-document-modal";
import type { DocumentWithOwner } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { exportDocument, type ExportFormat } from "../utils/export-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EditorTopActionsProps {
  document: DocumentWithOwner | null;
  isNewDoc: boolean;
  canEdit: boolean;
  onClose: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}

// Permission type from document
type UserPermission = "owner" | "view" | "edit" | "comment" | "edit_comment" | null;

export function EditorTopActions({
  document,
  isNewDoc,
  canEdit,
  onClose,
  onDuplicate,
  onDelete,
  onRename,
}: EditorTopActionsProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isProtectDialogOpen, setIsProtectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();

  // Get user permission from document
  const userPermission: UserPermission = (document as any)?.userPermission || null;
  const isOwner = userPermission === "owner";
  const canEditDoc = isOwner || userPermission === "edit" || userPermission === "edit_comment";

  // Protect document mutation
  const protectMutation = useMutation({
    mutationFn: async (isProtected: boolean) => {
      if (!document) throw new Error("No document");
      const response = await apiRequest("PATCH", `/api/docs/${document.id}/protect`, { isProtected });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update protection");
      }
      return response.json();
    },
    onSuccess: (_, isProtected) => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", document?.id] });
      toast({
        title: isProtected ? "Document protected" : "Protection removed",
        description: isProtected
          ? "This document is now protected from editing by non-owners."
          : "Anyone with edit access can now modify this document.",
      });
      setIsProtectDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update protection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = () => {
    if (document) {
      const link = `${window.location.origin}/docs/${document.id}`;
      navigator.clipboard.writeText(link);
      toast({ title: "Link copied", description: "Document link copied to clipboard." });
    }
  };

  const handleRename = () => {
    if (newTitle.trim() && onRename) {
      onRename(newTitle.trim());
      setIsRenameDialogOpen(false);
      setNewTitle("");
      toast({ title: "Document renamed", description: "The document title has been updated." });
    }
  };

  const handleOpenRenameDialog = () => {
    setNewTitle(document?.title || "");
    setIsRenameDialogOpen(true);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!document) return;
    try {
      let content = document.content || "";
      if (!content) {
        const response = await fetch(`/api/docs/${document.id}`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch document");
        const fullDoc = await response.json();
        content = fullDoc.content || "";
      }
      exportDocument(format, document.title || "Untitled", content, {
        author: document.owner?.displayName,
        createdAt: document.createdAt?.toString(),
      });
      toast({
        title: "Export started",
        description: format === "pdf" ? "Your PDF will open in a new window." : `Document exported as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({ title: "Export failed", description: "Could not export the document.", variant: "destructive" });
    }
  };

  // Determine which menu items to show based on permissions
  // Only owner can rename documents/pages
  const showRename = !isNewDoc && isOwner && onRename;
  const showCopyLink = !isNewDoc;
  const showDuplicate = !isNewDoc && onDuplicate;
  const showDownload = !isNewDoc;
  const showProtect = !isNewDoc && isOwner;
  const showDelete = !isNewDoc && isOwner && onDelete;
  const showShare = !isNewDoc && isOwner;

  // Check if there are any menu items to show
  const hasMenuItems = showRename || showCopyLink || showDuplicate || showDownload || showProtect || showDelete;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {/* Share Button - Only for owners */}
        {showShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                className="h-8 px-1.5 sm:px-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Share2 className="h-4 w-4 sm:mr-1.5" />
                <span className="text-sm hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share this document</TooltipContent>
          </Tooltip>
        )}

        {/* Options Menu */}
        {hasMenuItems && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Rename - Requires edit permission */}
              {showRename && (
                <DropdownMenuItem onClick={handleOpenRenameDialog}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}

              {/* Copy Link - Anyone with access */}
              {showCopyLink && (
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
              )}

              {/* Duplicate - Anyone with access can duplicate */}
              {showDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}

              {/* Download/Export - Anyone with access */}
              {showDownload && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      <DropdownMenuItem onClick={() => handleExport("docx")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-600 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word Document</span>
                          <span className="block text-xs text-gray-500">.docx</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("docm")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word Macro-Enabled Document</span>
                          <span className="block text-xs text-gray-500">.docm</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("word")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-400 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word 97-2003 Document</span>
                          <span className="block text-xs text-gray-500">.doc</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("dotm")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-300 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word Macro-Enabled Template</span>
                          <span className="block text-xs text-gray-500">.dotm</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("dotx")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word Template</span>
                          <span className="block text-xs text-gray-500">.dotx</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("dot")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-300 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word 97-2003 Template</span>
                          <span className="block text-xs text-gray-500">.dot</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">PDF Document</span>
                          <span className="block text-xs text-gray-500">.pdf</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("xps")}>
                        <FileText className="h-4 w-4 mr-2 text-teal-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">XPS Document</span>
                          <span className="block text-xs text-gray-500">.xps</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("mht")}>
                        <FileCode className="h-4 w-4 mr-2 text-orange-400 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Single File Web Page</span>
                          <span className="block text-xs text-gray-500">.mht, .mhtml</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("html")}>
                        <FileCode className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Web Page</span>
                          <span className="block text-xs text-gray-500">.htm, .html</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("rtf")}>
                        <FileType className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Rich Text Format</span>
                          <span className="block text-xs text-gray-500">.rtf</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("text")}>
                        <File className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Plain Text</span>
                          <span className="block text-xs text-gray-500">.txt</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("wordxml")}>
                        <FileCode className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Word XML Document</span>
                          <span className="block text-xs text-gray-500">.xml</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("strict")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-teal-600 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">Strict Open XML Document</span>
                          <span className="block text-xs text-gray-500">.docx</span>
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("odt")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm">OpenDocument Text</span>
                          <span className="block text-xs text-gray-500">.odt</span>
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}

              {/* Protect Document - Owner only */}
              {showProtect && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsProtectDialogOpen(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Protect document
                  </DropdownMenuItem>
                </>
              )}

              {/* Delete - Owner only */}
              {showDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Close Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close</TooltipContent>
        </Tooltip>

        {/* Share Modal */}
        {document && (
          <ShareDocumentModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            document={document}
          />
        )}

        {/* Rename Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>
                Enter a new name for this document.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  placeholder="Document title"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={!newTitle.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Protect Document Dialog */}
        <Dialog open={isProtectDialogOpen} onOpenChange={setIsProtectDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Protect document</DialogTitle>
              <DialogDescription>
                When protected, only the document owner can edit this document. Shared users will have read-only access regardless of their permission level.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5">
                <Label htmlFor="protect-switch">Document protection</Label>
                <p className="text-sm text-muted-foreground">
                  {(document as any)?.isProtected ? "This document is currently protected" : "This document is not protected"}
                </p>
              </div>
              <Switch
                id="protect-switch"
                checked={(document as any)?.isProtected || false}
                onCheckedChange={(checked) => protectMutation.mutate(checked)}
                disabled={protectMutation.isPending}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProtectDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the document
                "{document?.title || "Untitled"}" and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
