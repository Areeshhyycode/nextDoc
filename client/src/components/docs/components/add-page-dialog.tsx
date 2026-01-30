/**
 * Add Page Dialog
 *
 * A reusable dialog component for adding new pages to documents.
 * Can be triggered from multiple places: toolbar, sidebar, templates, etc.
 */

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Loader2, FilePlus } from "lucide-react";

interface AddPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (title: string) => Promise<void>;
  isSubmitting?: boolean;
  documentTitle?: string;
}

export function AddPageDialog({
  isOpen,
  onClose,
  onAddPage,
  isSubmitting = false,
  documentTitle,
}: AddPageDialogProps) {
  const [pageTitle, setPageTitle] = useState("");

  const handleSubmit = async () => {
    if (!pageTitle.trim()) return;

    await onAddPage(pageTitle.trim());
    setPageTitle("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting && pageTitle.trim()) {
      handleSubmit();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPageTitle("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-emerald-600" />
            Add New Page
          </DialogTitle>
          <DialogDescription>
            {documentTitle
              ? `Create a new page under "${documentTitle}"`
              : "Create a new sub-page in this document"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter page title..."
              autoFocus
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!pageTitle.trim() || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4 mr-2" />
                Add Page
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
