import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface MutationCallbacks {
  onCreateSuccess: (newDoc: Document) => void;
  onDuplicateError: (suggestedTitle?: string) => void;
  onSaveComplete: () => void;
  onSaveError: () => void;
}

export function useDocumentCreateMutation(callbacks: Pick<MutationCallbacks, 'onCreateSuccess' | 'onDuplicateError'>) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      fontStyle?: string;
      fontSize?: string;
      pageWidth?: string;
      backgroundColor?: string;
      textColor?: string;
      headingColor?: string;
      linkColor?: string;
      showPageOutline?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/docs", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
      }
      return response.json() as Promise<Document>;
    },
    onSuccess: (newDoc: Document) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
      });
      toast({ title: "Document created successfully" });
      callbacks.onCreateSuccess(newDoc);
    },
    onError: (error: any) => {
      console.log("Create doc error:", error);
      if (error?.code === "DUPLICATE_TITLE" || error?.message?.includes("already exists")) {
        callbacks.onDuplicateError(error.suggestedTitle);
      } else {
        toast({ title: "Failed to create document", variant: "destructive" });
      }
    },
  });
}

export function useDocumentUpdateMutation(
  docId: string | null,
  callbacks: Pick<MutationCallbacks, 'onDuplicateError' | 'onSaveComplete' | 'onSaveError'>
) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      content?: string;
      tags?: string[];
      fontStyle?: string;
      fontSize?: string;
      pageWidth?: string;
      backgroundColor?: string;
      textColor?: string;
      headingColor?: string;
      linkColor?: string;
      showPageOutline?: boolean;
    }) => {
      const response = await apiRequest("PUT", `/api/docs/${docId}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, ...errorData };
      }
      return response.json() as Promise<Document>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/api/docs"),
      });
      callbacks.onSaveComplete();
    },
    onError: (error: any) => {
      console.log("Update doc error:", error);
      if (error?.code === "DUPLICATE_TITLE" || error?.message?.includes("already exists")) {
        callbacks.onDuplicateError(error.suggestedTitle);
      } else {
        toast({ title: "Failed to save document", variant: "destructive" });
      }
      callbacks.onSaveError();
    },
  });
}
