import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DocumentVersionWithCreator } from "@shared/schema";

interface VersionsResponse {
  versions: DocumentVersionWithCreator[];
  total: number;
}

export function useDocumentVersions(docId: string | null, enabled: boolean = true) {
  const { data, isLoading } = useQuery<VersionsResponse>({
    queryKey: ["/api/docs", docId, "versions"],
    enabled: !!docId && enabled,
  });

  return {
    versions: data?.versions || [],
    totalVersions: data?.total || 0,
    isLoading,
  };
}

export function useCreateManualVersion(docId: string | null) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/docs/${docId}/versions`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", docId, "versions"] });
      toast({ title: "Version saved" });
    },
    onError: () => {
      toast({ title: "Failed to save version", variant: "destructive" });
    },
  });
}

export function useRestoreVersion(docId: string | null) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (versionId: string) => {
      const response = await apiRequest("POST", `/api/docs/${docId}/versions/${versionId}/restore`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          (query.queryKey[0] as string).startsWith("/api/docs"),
      });
      toast({ title: "Version restored successfully" });
    },
    onError: () => {
      toast({ title: "Failed to restore version", variant: "destructive" });
    },
  });
}
