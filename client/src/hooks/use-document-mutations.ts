import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { docKeys } from "@/pages/docs";

interface UseDocumentMutationsOptions {
  docId: string;
  onDeleteSuccess?: () => void;
  onDuplicateSuccess?: (newDocId: string) => void;
  onRestoreSuccess?: () => void;
}

interface RenameError {
  code?: string;
  suggestedTitle?: string;
  message?: string;
}

export function useDocumentMutations({ docId, onDeleteSuccess, onDuplicateSuccess, onRestoreSuccess }: UseDocumentMutationsOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Centralized cache invalidation
  const invalidateDocQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: docKeys.lists(),
      refetchType: 'all',
    });
    await queryClient.invalidateQueries({
      queryKey: docKeys.detail(docId),
      refetchType: 'all',
    });
  };

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("PUT", `/api/docs/${docId}`, { title });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      return response.json();
    },
    onSuccess: async () => {
      await invalidateDocQueries();
      toast({ title: "Document renamed successfully" });
    },
    onError: (error: RenameError) => {
      if (error?.code === "DUPLICATE_TITLE") {
        toast({
          title: "Name already exists",
          description: error.suggestedTitle ? `Try: ${error.suggestedTitle}` : "Please choose a different name",
          variant: "destructive",
        });
      } else {
        toast({ title: "Failed to rename document", variant: "destructive" });
      }
    },
  });

  // Delete mutation (soft-delete → moves to trash)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/docs/${docId}`);
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      return true;
    },
    onSuccess: async () => {
      await invalidateDocQueries();
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: 'all' });
      toast({ title: "Document moved to trash", description: "You can restore it from Trash within 30 days." });
      onDeleteSuccess?.();
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    },
  });

  // Restore mutation (from trash)
  const restoreMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/docs/${docId}/restore`);
      if (!response.ok) {
        throw new Error("Failed to restore");
      }
      return response.json();
    },
    onSuccess: async () => {
      await invalidateDocQueries();
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: 'all' });
      toast({ title: "Document restored successfully" });
      onRestoreSuccess?.();
    },
    onError: () => {
      toast({ title: "Failed to restore document", variant: "destructive" });
    },
  });

  // Permanent delete mutation (from trash — irreversible)
  const permanentDeleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/docs/${docId}/permanent`);
      if (!response.ok) {
        throw new Error("Failed to permanently delete");
      }
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: docKeys.trash(), refetchType: 'all' });
      toast({ title: "Document permanently deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/docs/${docId}/duplicate`);
      if (!response.ok) {
        throw new Error("Failed to duplicate");
      }
      return response.json();
    },
    onSuccess: async (newDoc: { id: string }) => {
      await invalidateDocQueries();
      toast({ title: "Document duplicated successfully" });
      onDuplicateSuccess?.(newDoc.id);
    },
    onError: () => {
      toast({ title: "Failed to duplicate document", variant: "destructive" });
    },
  });

  // Pin mutation
  const pinMutation = useMutation({
    mutationFn: async (isPinned: boolean) => {
      const response = await apiRequest("PATCH", `/api/docs/${docId}/pin`, { isPinned });
      if (!response.ok) {
        throw new Error("Failed to update pin");
      }
      return response.json();
    },
    onSuccess: async (data: { isPinned: boolean }) => {
      await invalidateDocQueries();
      toast({
        title: data.isPinned ? "Document pinned" : "Document unpinned",
      });
    },
    onError: () => {
      toast({ title: "Failed to update pin", variant: "destructive" });
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      const response = await apiRequest("PATCH", `/api/docs/${docId}/favorite`, { isFavorite });
      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
      return response.json();
    },
    onSuccess: async (data: { isFavorite: boolean }) => {
      await invalidateDocQueries();
      toast({
        title: data.isFavorite ? "Added to favorites" : "Removed from favorites",
      });
    },
    onError: () => {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    },
  });

  return {
    rename: renameMutation,
    delete: deleteMutation,
    duplicate: duplicateMutation,
    favorite: favoriteMutation,
    pin: pinMutation,
    restore: restoreMutation,
    permanentDelete: permanentDeleteMutation,
    isAnyPending:
      renameMutation.isPending ||
      deleteMutation.isPending ||
      duplicateMutation.isPending ||
      favoriteMutation.isPending ||
      pinMutation.isPending ||
      restoreMutation.isPending ||
      permanentDeleteMutation.isPending,
  };
}
