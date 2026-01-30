import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Space types
interface DocumentSpace {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  ownerId: string;
  parentSpaceId: string | null;
  sortOrder: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentSpaceWithMeta extends DocumentSpace {
  documentCount: number;
  children: DocumentSpaceWithMeta[];
}

// Query keys
export const spaceKeys = {
  all: ['spaces'] as const,
  tree: () => [...spaceKeys.all, 'tree'] as const,
  detail: (id: string) => [...spaceKeys.all, 'detail', id] as const,
  documents: (id: string) => [...spaceKeys.all, 'documents', id] as const,
  forDocument: (documentId: string) => [...spaceKeys.all, 'for-document', documentId] as const,
};

/**
 * Get the space tree for the current user
 */
export function useSpaceTree() {
  return useQuery<DocumentSpaceWithMeta[]>({
    queryKey: spaceKeys.tree(),
    queryFn: async () => {
      const response = await fetch('/api/docs/spaces', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch spaces');
      return response.json();
    },
    staleTime: 60_000, // Cache for 1 minute
    gcTime: 5 * 60_000,
  });
}

/**
 * Get a single space by ID
 */
export function useSpace(id: string | null) {
  return useQuery<DocumentSpace>({
    queryKey: spaceKeys.detail(id || ''),
    queryFn: async () => {
      const response = await fetch(`/api/docs/spaces/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch space');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Get document IDs in a space
 */
export function useSpaceDocuments(spaceId: string | null) {
  return useQuery<{ documentIds: string[] }>({
    queryKey: spaceKeys.documents(spaceId || ''),
    queryFn: async () => {
      const response = await fetch(`/api/docs/spaces/${spaceId}/documents`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch space documents');
      return response.json();
    },
    enabled: !!spaceId,
  });
}

/**
 * Get spaces for a specific document
 */
export function useDocumentSpaces(documentId: string | null) {
  return useQuery<DocumentSpace[]>({
    queryKey: spaceKeys.forDocument(documentId || ''),
    queryFn: async () => {
      const response = await fetch(`/api/docs/${documentId}/spaces`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch document spaces');
      return response.json();
    },
    enabled: !!documentId,
  });
}

/**
 * Create a new space
 */
export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      parentSpaceId?: string;
      isPrivate?: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/docs/spaces', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create space');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      toast({ title: "Space created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create space", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Update a space
 */
export function useUpdateSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      parentSpaceId?: string | null;
      sortOrder?: number;
      isPrivate?: boolean;
    }) => {
      const response = await apiRequest('PATCH', `/api/docs/spaces/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update space');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.id) });
      toast({ title: "Space updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update space", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Delete a space
 */
export function useDeleteSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/docs/spaces/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete space');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      toast({ title: "Space deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete space", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Add a document to a space
 */
export function useAddDocumentToSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ spaceId, documentId }: { spaceId: string; documentId: string }) => {
      const response = await apiRequest('POST', `/api/docs/spaces/${spaceId}/documents`, { documentId });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add document to space');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.invalidateQueries({ queryKey: spaceKeys.documents(variables.spaceId) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.forDocument(variables.documentId) });
      toast({ title: "Document added to space" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add document", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Remove a document from a space
 */
export function useRemoveDocumentFromSpace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ spaceId, documentId }: { spaceId: string; documentId: string }) => {
      const response = await apiRequest('DELETE', `/api/docs/spaces/${spaceId}/documents/${documentId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove document from space');
      }
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.invalidateQueries({ queryKey: spaceKeys.documents(variables.spaceId) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.forDocument(variables.documentId) });
      toast({ title: "Document removed from space" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove document", description: error.message, variant: "destructive" });
    },
  });
}

/**
 * Move a document between spaces
 */
export function useMoveDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      documentId,
      fromSpaceId,
      toSpaceId
    }: {
      documentId: string;
      fromSpaceId: string | null;
      toSpaceId: string;
    }) => {
      const response = await apiRequest('POST', '/api/docs/spaces/move-document', {
        documentId,
        fromSpaceId,
        toSpaceId
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to move document');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      if (variables.fromSpaceId) {
        queryClient.invalidateQueries({ queryKey: spaceKeys.documents(variables.fromSpaceId) });
      }
      queryClient.invalidateQueries({ queryKey: spaceKeys.documents(variables.toSpaceId) });
      queryClient.invalidateQueries({ queryKey: spaceKeys.forDocument(variables.documentId) });
      toast({ title: "Document moved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to move document", description: error.message, variant: "destructive" });
    },
  });
}
