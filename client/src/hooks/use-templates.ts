import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentTemplate {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  icon: string | null;
  iconColor: string | null;
  isSystem: boolean;
  createdBy: string | null;
  isPublic: boolean;
  usageCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Query keys for templates
export const templateKeys = {
  all: ['templates'] as const,
  list: () => [...templateKeys.all, 'list'] as const,
  byCategory: (category: string) => [...templateKeys.all, 'category', category] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

/**
 * Fetch all public templates
 */
export function useTemplates(category?: string) {
  return useQuery<DocumentTemplate[]>({
    queryKey: category ? templateKeys.byCategory(category) : templateKeys.list(),
    queryFn: async () => {
      const url = category
        ? `/api/docs/templates?category=${encodeURIComponent(category)}`
        : '/api/docs/templates';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    staleTime: 5 * 60_000, // Templates rarely change, cache for 5 minutes
    gcTime: 30 * 60_000, // Keep in cache for 30 minutes
  });
}

/**
 * Fetch a single template by ID
 */
export function useTemplate(id: string | null) {
  return useQuery<DocumentTemplate>({
    queryKey: templateKeys.detail(id || ''),
    queryFn: async () => {
      const response = await fetch(`/api/docs/templates/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch template');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Use a template to create a new document
 */
export function useTemplateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest('POST', `/api/docs/templates/${templateId}/use`);
      if (!response.ok) {
        throw new Error('Failed to create document from template');
      }
      return response.json();
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      toast({
        title: "Document created",
        description: "New document created from template",
      });
      return newDoc;
    },
    onError: () => {
      toast({
        title: "Failed to create document",
        description: "Could not create document from template",
        variant: "destructive",
      });
    },
  });
}

/**
 * Seed default templates (admin action)
 */
export function useSeedTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/docs/templates/seed');
      if (!response.ok) {
        throw new Error('Failed to seed templates');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      toast({
        title: "Templates seeded",
        description: "Default templates have been created",
      });
    },
    onError: () => {
      toast({
        title: "Failed to seed templates",
        variant: "destructive",
      });
    },
  });
}
