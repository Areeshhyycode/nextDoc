import { useState, useEffect, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DocumentWithOwner } from "@shared/schema";
import type { UserSearchResult, DocumentShare, PermissionType, PublicLinkResponse } from "./types";

export function useDocumentSharing(doc: DocumentWithOwner, isOpen: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [permission, setPermission] = useState<PermissionType>("view");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Public link state
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(doc.publicLinkEnabled || false);
  const [publicLinkToken, setPublicLinkToken] = useState(doc.publicLinkToken || "");

  useEffect(() => {
    setPublicLinkEnabled(doc.publicLinkEnabled || false);
    setPublicLinkToken(doc.publicLinkToken || "");
  }, [doc.publicLinkEnabled, doc.publicLinkToken]);

  // Search users query
  const { data: searchResults = [], isLoading: isSearching } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/users/search", deferredSearchQuery],
    queryFn: async () => {
      if (deferredSearchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(deferredSearchQuery)}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: deferredSearchQuery.length >= 2,
    staleTime: 30_000,
  });

  // Existing shares query
  const { data: shares = [], isLoading: isLoadingShares } = useQuery<DocumentShare[]>({
    queryKey: [`/api/docs/${doc.id}/shares`],
    enabled: isOpen,
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { userId: string; permission: string }) => {
      return apiRequest("POST", `/api/docs/${doc.id}/shares`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      setSearchQuery("");
      toast({ title: "Shared successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to share", description: error.message, variant: "destructive" });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: string }) => {
      return apiRequest("PATCH", `/api/docs/${doc.id}/shares/${userId}`, { permission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      toast({ title: "Permission updated" });
    },
  });

  // Remove share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/docs/${doc.id}/shares/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      toast({ title: "Access removed" });
    },
  });

  // Toggle public link mutation
  const togglePublicLinkMutation = useMutation({
    mutationFn: async (enabled: boolean): Promise<PublicLinkResponse> => {
      const response = await apiRequest("PATCH", `/api/docs/${doc.id}/public-link`, { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      setPublicLinkEnabled(data.publicLinkEnabled);
      setPublicLinkToken(data.publicLinkToken || "");
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      toast({
        title: data.publicLinkEnabled ? "Public link enabled" : "Public link disabled",
      });
    },
  });

  const publicLink = publicLinkToken ? `${window.location.origin}/public/docs/${publicLinkToken}` : "";

  // Filter already-shared users from search results
  const alreadySharedIds = shares.map(s => s.userId);
  const availableUsers = searchResults.filter(
    user => !alreadySharedIds.includes(user.id) && user.id !== doc.owner?.id
  );

  return {
    searchQuery,
    setSearchQuery,
    permission,
    setPermission,
    searchResults,
    isSearching,
    shares,
    isLoadingShares,
    shareMutation,
    updatePermissionMutation,
    removeShareMutation,
    publicLinkEnabled,
    togglePublicLinkMutation,
    publicLink,
    availableUsers,
  };
}
