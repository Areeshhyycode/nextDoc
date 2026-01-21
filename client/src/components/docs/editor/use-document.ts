import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getTemplate } from "@/components/docs/templates";
import { PageStyles } from "@/components/docs/components/page-styles-panel";

const DEFAULT_PAGE_STYLES: PageStyles = {
  fontStyle: "system",
  fontSize: "default",
  pageWidth: "default",
  showCoverImage: false,
  showPageIconAndTitle: true,
  showAuthor: false,
  showContributors: false,
  showSubtitle: false,
  showLastModified: true,
  showPageOutline: false,
};

export function useDocument() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showStarterOptions, setShowStarterOptions] = useState(true);
  const [pageStyles, setPageStyles] = useState<PageStyles>(DEFAULT_PAGE_STYLES);
  const [duplicateError, setDuplicateError] = useState<{
    show: boolean;
    suggestedTitle?: string;
  }>({ show: false });
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track original values to detect actual changes
  const originalTitleRef = useRef<string>("");
  const originalContentRef = useRef<string>("");

  const isNewDoc = params.id === "new";
  const docId = isNewDoc ? null : params.id;

  // Get category from query params for new docs
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") as
    | "blank"
    | "meeting_notes"
    | "project_overview"
    | "todo_list"
    || "blank";

  // Fetch existing document
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ["/api/docs", docId],
    enabled: !isNewDoc && !!docId,
  });

  // Fetch comments for count badge
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ["/api/docs", docId, "comments"],
    enabled: !isNewDoc && !!docId,
  });

  const openCommentsCount = comments.filter(
    (c: any) => c.status === "open"
  ).length;

  // Load document or template
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content || "");
      setTags(document.tags || []);
      setLastSavedAt(document.updatedAt ? new Date(document.updatedAt) : null);
      setShowStarterOptions(false);

      // Store original values for change detection
      originalTitleRef.current = document.title;
      originalContentRef.current = document.content || "";

      // Load page styles from document
      setPageStyles({
        fontStyle: (document.fontStyle || "system") as "system" | "serif" | "mono",
        fontSize: (document.fontSize || "default") as "small" | "default" | "large",
        pageWidth: (document.pageWidth || "default") as "default" | "full",
        showCoverImage: document.showCoverImage ?? false,
        showPageIconAndTitle: document.showPageIconAndTitle ?? true,
        showAuthor: document.showAuthor ?? false,
        showContributors: document.showContributors ?? false,
        showSubtitle: document.showSubtitle ?? false,
        showLastModified: document.showLastModified ?? true,
        showPageOutline: document.showPageOutline ?? false,
      });
    } else if (
      isNewDoc &&
      (category === "meeting_notes" || category === "project_overview" || category === "todo_list")
    ) {
      // Use template from templates folder
      const template = getTemplate(category);
      setTitle(template.title);
      setContent(template.content);
      setShowStarterOptions(false);
    }
  }, [document, isNewDoc, category]);

  // Track document view when opened
  useEffect(() => {
    if (docId && !isNewDoc) {
      apiRequest("PATCH", `/api/docs/${docId}/view`)
        .then(() => {
          // Invalidate docs query so list shows updated lastViewedAt
          queryClient.invalidateQueries({
            predicate: (query) =>
              typeof query.queryKey[0] === "string" &&
              query.queryKey[0].startsWith("/api/docs"),
          });
        })
        .catch((err) => {
          console.error("Failed to track document view:", err);
        });
    }
  }, [docId, isNewDoc]);

  // Hide starter options when content is added
  useEffect(() => {
    if (content && content !== "<p></p>" && content.trim().length > 0) {
      setShowStarterOptions(false);
    }
  }, [content]);

  // Create mutation
  const createDocMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      fontStyle?: string;
      fontSize?: string;
      pageWidth?: string;
      showCoverImage?: boolean;
      showPageIconAndTitle?: boolean;
      showAuthor?: boolean;
      showContributors?: boolean;
      showSubtitle?: boolean;
      showLastModified?: boolean;
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
      navigate(`/docs/${newDoc.id}`);
    },
    onError: (error: any) => {
      console.log("Create doc error:", error);
      if (error?.code === "DUPLICATE_TITLE" || error?.message?.includes("already exists")) {
        // Show inline warning instead of toast
        setDuplicateError({
          show: true,
          suggestedTitle: error.suggestedTitle,
        });
      } else {
        toast({ title: "Failed to create document", variant: "destructive" });
      }
    },
  });

  // Update mutation
  const updateDocMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      tags: string[];
      fontStyle?: string;
      fontSize?: string;
      pageWidth?: string;
      showCoverImage?: boolean;
      showPageIconAndTitle?: boolean;
      showAuthor?: boolean;
      showContributors?: boolean;
      showSubtitle?: boolean;
      showLastModified?: boolean;
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
      setLastSavedAt(new Date());
      setIsSaving(false);
    },
    onError: (error: any) => {
      console.log("Update doc error:", error);
      if (error?.code === "DUPLICATE_TITLE" || error?.message?.includes("already exists")) {
        // Show inline warning instead of toast
        setDuplicateError({
          show: true,
          suggestedTitle: error.suggestedTitle,
        });
      } else {
        toast({ title: "Failed to save document", variant: "destructive" });
      }
      setIsSaving(false);
    },
  });

  // Clear duplicate error when title changes
  useEffect(() => {
    if (duplicateError.show) {
      setDuplicateError({ show: false });
    }
  }, [title]);

  // Autosave functionality - only save if title or content actually changed
  useEffect(() => {
    if (!isNewDoc && docId && (title || content)) {
      // Check if anything actually changed
      const titleChanged = title !== originalTitleRef.current;
      const contentChanged = content !== originalContentRef.current;

      // Don't trigger autosave if nothing changed
      if (!titleChanged && !contentChanged) {
        return;
      }

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        // Build update payload - only include changed fields
        const updatePayload: any = {
          tags,
          ...pageStyles,
        };

        // Only include title if it changed
        if (titleChanged) {
          updatePayload.title = title;
          originalTitleRef.current = title; // Update ref after save
        }

        // Only include content if it changed
        if (contentChanged) {
          updatePayload.content = content;
          originalContentRef.current = content; // Update ref after save
        }

        setIsSaving(true);
        updateDocMutation.mutate(updatePayload);
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, content, tags, pageStyles, isNewDoc, docId]);

  const handleSave = () => {
    const styleData = {
      fontStyle: pageStyles.fontStyle,
      fontSize: pageStyles.fontSize,
      pageWidth: pageStyles.pageWidth,
      showCoverImage: pageStyles.showCoverImage,
      showPageIconAndTitle: pageStyles.showPageIconAndTitle,
      showAuthor: pageStyles.showAuthor,
      showContributors: pageStyles.showContributors,
      showSubtitle: pageStyles.showSubtitle,
      showLastModified: pageStyles.showLastModified,
      showPageOutline: pageStyles.showPageOutline,
    };

    if (isNewDoc) {
      createDocMutation.mutate({
        title,
        content,
        category,
        tags,
        ...styleData,
      });
    } else {
      setIsSaving(true);
      updateDocMutation.mutate({
        title,
        content,
        tags,
        ...styleData,
      });
    }
  };

  const handleStyleChange = (styles: Partial<PageStyles>) => {
    setPageStyles((prev) => ({ ...prev, ...styles }));
  };

  const saveDocumentForComment = async (): Promise<string> => {
    if (!isNewDoc && docId) {
      return docId;
    }

    return new Promise((resolve, reject) => {
      createDocMutation.mutate(
        {
          title: title || "Untitled",
          content,
          category,
          tags,
          ...pageStyles,
        },
        {
          onSuccess: (newDoc) => {
            resolve(newDoc.id);
          },
          onError: () => {
            reject(new Error("Failed to save document"));
          },
        }
      );
    });
  };

  const applyTemplate = (
    templateType: "blank" | "meeting" | "todo" | "table"
  ) => {
    setShowStarterOptions(false);
    switch (templateType) {
      case "blank":
        setContent("<p></p>");
        break;
      case "meeting":
        setTitle("Meeting Notes - " + new Date().toLocaleDateString());
        setContent(
          `<h2>Attendees</h2><ul><li></li></ul><h2>Agenda</h2><ul><li></li></ul><h2>Discussion</h2><p></p><h2>Action Items</h2><ul><li></li></ul>`
        );
        break;
      case "todo":
        setTitle("To-Do List");
        setContent(
          `<h2>Tasks</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"></li></ul>`
        );
        break;
      case "table":
        setTitle("Data Table");
        setContent(
          `<h2>Table</h2><table><tbody><tr><th><p></p></th><th><p></p></th></tr><tr><td><p></p></td><td><p></p></td></tr></tbody></table>`
        );
        break;
    }
  };

  // Check if title is available (for real-time validation)
  const checkTitleAvailability = async (
    titleToCheck: string
  ): Promise<{ isUnique: boolean; suggestedTitle?: string }> => {
    try {
      const excludeParam = docId ? `&excludeDocId=${docId}` : "";
      const response = await apiRequest(
        "GET",
        `/api/docs/check-name?title=${encodeURIComponent(titleToCheck)}${excludeParam}`
      );
      const data = await response.json();
      return {
        isUnique: data.isUnique,
        suggestedTitle: data.suggestedTitle,
      };
    } catch {
      return { isUnique: true }; // Assume unique on error to not block user
    }
  };

  return {
    // State
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    pageStyles,
    lastSavedAt,
    isSaving,
    showStarterOptions,
    isNewDoc,
    docId,
    document,
    isLoading,
    openCommentsCount,
    duplicateError,

    // Actions
    handleSave,
    handleStyleChange,
    saveDocumentForComment,
    applyTemplate,
    navigate,
    checkTitleAvailability,

    // Mutation states
    isPending: createDocMutation.isPending,
  };
}
