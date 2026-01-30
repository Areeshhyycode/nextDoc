import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document, LastUpdaterInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getTemplate } from "@/components/docs/templates";
import { PageStyles } from "@/components/docs/components/page-styles-panel";

const DEFAULT_PAGE_STYLES: PageStyles = {
  fontStyle: "system",
  fontSize: "default",
  pageWidth: "default",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  headingColor: "#111827",
  h1Color: "#111827",
  h2Color: "#1f2937",
  h3Color: "#374151",
  h4Color: "#4b5563",
  h5Color: "#6b7280",
  h6Color: "#9ca3af",
  linkColor: "#3b82f6",
  codeBlockBg: "#f3f4f6",
  codeBlockText: "#1f2937",
  blockquoteBg: "#f9fafb",
  blockquoteText: "#4b5563",
  tableBorderColor: "#e5e7eb",
  tableHeaderBg: "#f3f4f6",
  showPageOutline: false,
};

// Extended document type with userPermission and related user info from API
type DocumentWithPermission = Document & {
  userPermission?: "owner" | "view" | "edit" | "comment" | "edit_comment";
  owner: { id: string; displayName: string; email: string; profilePicture: string | null } | null;
  lastUpdater?: LastUpdaterInfo | null;
};

export function useDocument() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitleInternal] = useState("");
  const [content, setContentInternal] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showStarterOptions, setShowStarterOptions] = useState(true);
  const [pageStyles, setPageStyles] = useState<PageStyles>(DEFAULT_PAGE_STYLES);
  const [duplicateError, setDuplicateError] = useState<{
    show: boolean;
    suggestedTitle?: string;
  }>({ show: false });
  const [titleRequiredError, setTitleRequiredError] = useState(false);
  const [hasShownViewOnlyWarning, setHasShownViewOnlyWarning] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track original values to detect actual changes
  const originalTitleRef = useRef<string>("");
  const originalContentRef = useRef<string>("");

  // Track if template has been loaded (to prevent re-loading on every render)
  const templateLoadedRef = useRef(false);

  const isNewDoc = params.id === "new";
  const docId = isNewDoc ? null : params.id;

  // Get category and template from query params for new docs
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") as
    | "blank"
    | "meeting_notes"
    | "project_overview"
    | "todo_list"
    || "blank";

  // Get custom template data if passed via URL - memoize to prevent re-parsing on every render
  const templateParam = urlParams.get("template");
  const customTemplate = useMemo(() => {
    if (!templateParam) return null;
    try {
      return JSON.parse(decodeURIComponent(templateParam)) as {
        title: string;
        content: string;
        templateId: string;
      };
    } catch {
      return null;
    }
  }, [templateParam]);

  // Fetch existing document (includes userPermission from backend)
  const { data: document, isLoading, error: documentError } = useQuery<DocumentWithPermission>({
    queryKey: ["/api/docs", docId],
    enabled: !isNewDoc && !!docId,
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (no access) errors
      if (error?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // Check if user has no access (403 error)
  const hasNoAccess = (documentError as any)?.status === 403;

  // Check if user can edit (owner, edit, or edit_comment permission)
  const canEdit = !document || document.userPermission === "owner" || document.userPermission === "edit" || document.userPermission === "edit_comment";
  const isViewOnly = document?.userPermission === "view";
  const isCommentOnly = document?.userPermission === "comment";
  const canEditAndComment = document?.userPermission === "edit_comment";

  // Show warning for users without edit permission trying to edit
  const showNoEditWarning = useCallback(() => {
    if (!hasShownViewOnlyWarning) {
      const permissionType = isViewOnly ? "view" : "comment";
      toast({
        title: permissionType === "view" ? "Read-Only Document" : "Comment-Only Access",
        description: permissionType === "view"
          ? "This document is read-only. You have view permissions and cannot make edits."
          : "You have comment-only permissions for this document. Editing is restricted, but you can add comments.",
        variant: "warning",
      });
      setHasShownViewOnlyWarning(true);
    }
  }, [hasShownViewOnlyWarning, toast, isViewOnly]);

  // Wrapped setTitle that checks permission
  const setTitle = useCallback((newTitle: string) => {
    if ((isViewOnly || isCommentOnly) && document) {
      showNoEditWarning();
      return; // Don't allow changes
    }
    setTitleInternal(newTitle);
  }, [isViewOnly, isCommentOnly, document, showNoEditWarning]);

  // Wrapped setContent that checks permission
  const setContent = useCallback((newContent: string) => {
    if ((isViewOnly || isCommentOnly) && document) {
      showNoEditWarning();
      return; // Don't allow changes
    }
    setContentInternal(newContent);
  }, [isViewOnly, isCommentOnly, document, showNoEditWarning]);

  // Fetch comments for count badge
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: ["/api/docs", docId, "comments"],
    enabled: !isNewDoc && !!docId,
  });

  const openCommentsCount = comments.filter(
    (c: any) => c.status === "open"
  ).length;

  // Load document or template - only run once for templates
  useEffect(() => {
    if (document) {
      // Use internal setters for initial load (bypass permission check)
      setTitleInternal(document.title);
      setContentInternal(document.content || "");
      setTags(document.tags || []);
      setLastSavedAt(document.updatedAt ? new Date(document.updatedAt) : null);
      setShowStarterOptions(false);

      // Store original values for change detection
      originalTitleRef.current = document.title;
      originalContentRef.current = document.content || "";

      // Load page styles from document
      setPageStyles({
        fontStyle: (document.fontStyle || "system") as PageStyles["fontStyle"],
        fontSize: (document.fontSize || "default") as "small" | "default" | "large",
        pageWidth: (document.pageWidth || "default") as "default" | "full",
        backgroundColor: document.backgroundColor || "#ffffff",
        textColor: document.textColor || "#1f2937",
        headingColor: document.headingColor || "#111827",
        h1Color: document.h1Color || "#111827",
        h2Color: document.h2Color || "#1f2937",
        h3Color: document.h3Color || "#374151",
        h4Color: document.h4Color || "#4b5563",
        h5Color: document.h5Color || "#6b7280",
        h6Color: document.h6Color || "#9ca3af",
        linkColor: document.linkColor || "#3b82f6",
        codeBlockBg: document.codeBlockBg || "#f3f4f6",
        codeBlockText: document.codeBlockText || "#1f2937",
        blockquoteBg: document.blockquoteBg || "#f9fafb",
        blockquoteText: document.blockquoteText || "#4b5563",
        tableBorderColor: document.tableBorderColor || "#e5e7eb",
        tableHeaderBg: document.tableHeaderBg || "#f3f4f6",
        showPageOutline: document.showPageOutline ?? false,
      });
    } else if (isNewDoc && customTemplate && !templateLoadedRef.current) {
      // Use custom template from URL parameter (from template preview modal)
      // Only load once to allow user to edit title
      setTitleInternal(customTemplate.title);
      setContentInternal(customTemplate.content);
      setShowStarterOptions(false);
      templateLoadedRef.current = true;
    } else if (
      isNewDoc &&
      !templateLoadedRef.current &&
      (category === "meeting_notes" || category === "project_overview" || category === "todo_list")
    ) {
      // Use template from templates folder (use internal setters)
      // Only load once to allow user to edit title
      const template = getTemplate(category);
      setTitleInternal(template.title);
      setContentInternal(template.content);
      setShowStarterOptions(false);
      templateLoadedRef.current = true;
    }
  }, [document, isNewDoc, category, customTemplate]);

  // Track document view when opened
  useEffect(() => {
    if (docId && !isNewDoc) {
      apiRequest("PATCH", `/api/docs/${docId}/view`)
        .then(() => {
          // Invalidate docs list so lastViewedAt updates in the table
          queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
        })
        .catch((err) => {
          console.error("Failed to track document view:", err);
        });
    }
  }, [docId, isNewDoc]);

  // Helper to check if content is effectively empty
  const isContentEmpty = (htmlContent: string) => {
    if (!htmlContent) return true;
    if (htmlContent === "<p></p>") return true;
    // Strip HTML tags and check for actual text content
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  };

  // Toggle starter options based on content - show when empty, hide when has content
  useEffect(() => {
    // Don't auto-show starter options - user can access templates via slash menu
    setShowStarterOptions(false);
  }, [content, isNewDoc]);

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

  // Clear duplicate error and title required error when title changes
  useEffect(() => {
    if (duplicateError.show) {
      setDuplicateError({ show: false });
    }
    if (titleRequiredError && title.trim()) {
      setTitleRequiredError(false);
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
    // Validate title is not empty
    if (!title.trim()) {
      setTitleRequiredError(true);
      return;
    }

    const styleData = {
      fontStyle: pageStyles.fontStyle,
      fontSize: pageStyles.fontSize,
      pageWidth: pageStyles.pageWidth,
      backgroundColor: pageStyles.backgroundColor,
      textColor: pageStyles.textColor,
      headingColor: pageStyles.headingColor,
      h1Color: pageStyles.h1Color,
      h2Color: pageStyles.h2Color,
      h3Color: pageStyles.h3Color,
      h4Color: pageStyles.h4Color,
      h5Color: pageStyles.h5Color,
      h6Color: pageStyles.h6Color,
      linkColor: pageStyles.linkColor,
      codeBlockBg: pageStyles.codeBlockBg,
      codeBlockText: pageStyles.codeBlockText,
      blockquoteBg: pageStyles.blockquoteBg,
      blockquoteText: pageStyles.blockquoteText,
      tableBorderColor: pageStyles.tableBorderColor,
      tableHeaderBg: pageStyles.tableHeaderBg,
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
    templateType: "blank" | "meeting" | "todo" | "table" | "project_overview"
  ) => {
    setShowStarterOptions(false);
    // Use internal setters for templates (new docs don't need permission check)
    switch (templateType) {
      case "blank":
        setContentInternal("<p></p>");
        break;
      case "meeting":
        setTitleInternal("Meeting Notes - " + new Date().toLocaleDateString());
        setContentInternal(
          `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> </p>
<hr>
<h2>Agenda</h2>
<ol><li>Topic 1</li><li>Topic 2</li><li>Topic 3</li></ol>
<h2>Discussion Points</h2>
<h3>Topic 1</h3>
<p>Notes about topic 1...</p>
<h3>Topic 2</h3>
<p>Notes about topic 2...</p>
<h2>Action Items</h2>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><p>Action item 1 - Assigned to: </p></li>
<li data-type="taskItem" data-checked="false"><p>Action item 2 - Assigned to: </p></li>
<li data-type="taskItem" data-checked="false"><p>Action item 3 - Assigned to: </p></li>
</ul>
<h2>Next Steps</h2>
<p>Summary of next steps and follow-up items...</p>
<hr>
<p><strong>Next Meeting:</strong> </p>`
        );
        break;
      case "todo":
        setTitleInternal("To-Do List");
        setContentInternal(
          `<h2>Tasks</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"></li></ul>`
        );
        break;
      case "table":
        setContentInternal(
          `<table>
<tr>
<th><p>Header 1</p></th>
<th><p>Header 2</p></th>
<th><p>Header 3</p></th>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
<tr>
<td><p></p></td>
<td><p></p></td>
<td><p></p></td>
</tr>
</table>
<p></p>`
        );
        break;
      case "project_overview":
        setTitleInternal("Project Overview");
        setContentInternal(
          `<h1>Project Overview</h1>
<h2>Summary</h2>
<p>Brief description of the project goals and objectives.</p>
<h2>Timeline</h2>
<table><tbody>
<tr><th><p>Phase</p></th><th><p>Start Date</p></th><th><p>End Date</p></th><th><p>Status</p></th></tr>
<tr><td><p>Planning</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
<tr><td><p>Development</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
<tr><td><p>Testing</p></td><td><p>-</p></td><td><p>-</p></td><td><p>Not Started</p></td></tr>
</tbody></table>
<h2>Key Deliverables</h2>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><p>Deliverable 1</p></li>
<li data-type="taskItem" data-checked="false"><p>Deliverable 2</p></li>
<li data-type="taskItem" data-checked="false"><p>Deliverable 3</p></li>
</ul>
<h2>Team Members</h2>
<table><tbody>
<tr><th><p>Name</p></th><th><p>Role</p></th><th><p>Responsibilities</p></th></tr>
<tr><td><p>-</p></td><td><p>Project Lead</p></td><td><p>Overall coordination</p></td></tr>
<tr><td><p>-</p></td><td><p>Developer</p></td><td><p>Implementation</p></td></tr>
</tbody></table>
<h2>Notes</h2>
<p>Additional notes and comments...</p>`
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
    titleRequiredError,
    category,

    // Permission states
    canEdit,
    isViewOnly,
    isCommentOnly,
    canEditAndComment,
    hasNoAccess,
    userPermission: document?.userPermission,

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
