import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document, PageTreeNode } from "@shared/schema";

// Helper to count all pages recursively
function countPages(pages: PageTreeNode[]): number {
  let count = 0;
  for (const page of pages) {
    count += 1;
    if (page.children && page.children.length > 0) {
      count += countPages(page.children);
    }
  }
  return count;
}

interface RootDocumentInfo {
  id: string;
  title: string;
  isRoot: boolean;
}

export function useDocumentPages(documentId: string | null) {
  const { toast } = useToast();

  // First, fetch the root document for the current document
  const {
    data: rootDocInfo,
    isLoading: isLoadingRoot,
  } = useQuery<RootDocumentInfo>({
    queryKey: ["/api/docs", documentId, "root"],
    queryFn: async () => {
      if (!documentId) return { id: documentId || "", title: "", isRoot: true };
      const response = await apiRequest("GET", `/api/docs/${documentId}/root`);
      if (!response.ok) {
        throw new Error("Failed to fetch root document");
      }
      return response.json();
    },
    enabled: !!documentId,
  });

  // The root document ID to use for fetching pages and adding new pages
  const rootDocumentId = rootDocInfo?.id || documentId;

  // Fetch page tree for the ROOT document (not the current document)
  const {
    data: pages = [],
    isLoading: isLoadingPages,
    error,
  } = useQuery<PageTreeNode[]>({
    queryKey: ["/api/docs", rootDocumentId, "page-tree"],
    queryFn: async () => {
      if (!rootDocumentId) return [];
      const response = await apiRequest("GET", `/api/docs/${rootDocumentId}/page-tree`);
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      return response.json();
    },
    enabled: !!rootDocumentId && !isLoadingRoot,
  });

  // Create a new page under the ROOT document
  const createPageMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!rootDocumentId) throw new Error("Root document ID is required");
      const response = await apiRequest("POST", `/api/docs/${rootDocumentId}/pages`, { title });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create page");
      }
      return response.json() as Promise<Document>;
    },
    onSuccess: (newPage) => {
      // Invalidate the page tree query to refetch
      queryClient.invalidateQueries({
        queryKey: ["/api/docs", rootDocumentId, "page-tree"],
      });
      toast({
        title: "Page created",
        description: `"${newPage.title}" has been added.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create page",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addPage = async (title: string): Promise<Document | null> => {
    try {
      return await createPageMutation.mutateAsync(title);
    } catch {
      return null;
    }
  };

  // Calculate total page count
  const totalPagesCount = countPages(pages);

  const isLoading = isLoadingRoot || isLoadingPages;

  return {
    pages,
    totalPagesCount,
    isLoading,
    error,
    addPage,
    isCreating: createPageMutation.isPending,
    // Export root document info for the sidebar
    rootDocumentId,
    rootDocumentTitle: rootDocInfo?.title || "",
  };
}
