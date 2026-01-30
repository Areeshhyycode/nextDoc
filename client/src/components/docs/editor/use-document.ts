import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getTemplate } from "@/components/docs/templates";
import type { PageStyles } from "./use-document/types";
import { DEFAULT_PAGE_STYLES } from "./use-document/types";
import { useDocumentFetch, useDocumentComments, useDocumentViewTracking } from "./use-document/use-document-queries";
import { useDocumentCreateMutation, useDocumentUpdateMutation } from "./use-document/use-document-mutations";
import { useDocumentPermissions } from "./use-document/use-document-permissions";
import { useDocumentAutosave } from "./use-document/use-document-autosave";
import {
  getBlankContent,
  getMeetingNotesContent,
  getTodoContent,
  getTableContent,
  getProjectOverviewContent,
} from "./use-document/template-content";

export function useDocument() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  // Core state
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

  // Refs for change detection
  const originalTitleRef = useRef<string>("");
  const originalContentRef = useRef<string>("");
  const templateLoadedRef = useRef(false);

  const isNewDoc = params.id === "new";
  const docId = isNewDoc ? null : params.id;

  // Parse URL params
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") as
    | "blank"
    | "meeting_notes"
    | "project_overview"
    | "todo_list"
    || "blank";

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

  // --- Composed hooks ---

  const { document, isLoading, hasNoAccess } = useDocumentFetch(docId, isNewDoc);
  const { openCommentsCount } = useDocumentComments(docId, isNewDoc);
  useDocumentViewTracking(docId, isNewDoc);

  const { canEdit, isViewOnly, isCommentOnly, canEditAndComment, shouldBlockEdit } =
    useDocumentPermissions(document);

  // Mutation callbacks
  const handleDuplicateError = useCallback((suggestedTitle?: string) => {
    setDuplicateError({ show: true, suggestedTitle });
  }, []);

  const createMutation = useDocumentCreateMutation({
    onCreateSuccess: (newDoc) => navigate(`/docs/${newDoc.id}`),
    onDuplicateError: handleDuplicateError,
  });

  const updateMutation = useDocumentUpdateMutation(docId, {
    onDuplicateError: handleDuplicateError,
    onSaveComplete: () => { setLastSavedAt(new Date()); setIsSaving(false); },
    onSaveError: () => setIsSaving(false),
  });

  // Permission-guarded setters
  const setTitle = useCallback((newTitle: string) => {
    if (shouldBlockEdit()) return;
    setTitleInternal(newTitle);
  }, [shouldBlockEdit]);

  const setContent = useCallback((newContent: string) => {
    if (shouldBlockEdit()) return;
    setContentInternal(newContent);
  }, [shouldBlockEdit]);

  // --- Effects ---

  // Load document or template
  useEffect(() => {
    if (document) {
      setTitleInternal(document.title);
      setContentInternal(document.content || "");
      setTags(document.tags || []);
      setLastSavedAt(document.updatedAt ? new Date(document.updatedAt) : null);
      setShowStarterOptions(false);

      originalTitleRef.current = document.title;
      originalContentRef.current = document.content || "";

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
      setTitleInternal(customTemplate.title);
      setContentInternal(customTemplate.content);
      setShowStarterOptions(false);
      templateLoadedRef.current = true;
    } else if (
      isNewDoc &&
      !templateLoadedRef.current &&
      (category === "meeting_notes" || category === "project_overview" || category === "todo_list")
    ) {
      const template = getTemplate(category);
      setTitleInternal(template.title);
      setContentInternal(template.content);
      setShowStarterOptions(false);
      templateLoadedRef.current = true;
    }
  }, [document, isNewDoc, category, customTemplate]);

  // Hide starter options
  useEffect(() => {
    setShowStarterOptions(false);
  }, [content, isNewDoc]);

  // Clear errors when title changes
  useEffect(() => {
    if (duplicateError.show) setDuplicateError({ show: false });
    if (titleRequiredError && title.trim()) setTitleRequiredError(false);
  }, [title]);

  // Autosave
  useDocumentAutosave({
    title,
    content,
    tags,
    pageStyles,
    isNewDoc,
    docId,
    originalTitleRef,
    originalContentRef,
    onSave: (payload) => updateMutation.mutate(payload),
    onSavingStart: () => setIsSaving(true),
  });

  // --- Actions ---

  const handleSave = () => {
    if (!title.trim()) {
      setTitleRequiredError(true);
      return;
    }

    const styleData = { ...pageStyles };

    if (isNewDoc) {
      createMutation.mutate({ title, content, category, tags, ...styleData });
    } else {
      setIsSaving(true);
      updateMutation.mutate({ title, content, tags, ...styleData });
    }
  };

  const handleStyleChange = (styles: Partial<PageStyles>) => {
    setPageStyles((prev) => ({ ...prev, ...styles }));
  };

  const saveDocumentForComment = async (): Promise<string> => {
    if (!isNewDoc && docId) return docId;

    return new Promise((resolve, reject) => {
      createMutation.mutate(
        { title: title || "Untitled", content, category, tags, ...pageStyles },
        {
          onSuccess: (newDoc) => resolve(newDoc.id),
          onError: () => reject(new Error("Failed to save document")),
        }
      );
    });
  };

  const applyTemplate = (
    templateType: "blank" | "meeting" | "todo" | "table" | "project_overview"
  ) => {
    setShowStarterOptions(false);
    switch (templateType) {
      case "blank":
        setContentInternal(getBlankContent());
        break;
      case "meeting": {
        const m = getMeetingNotesContent();
        setTitleInternal(m.title);
        setContentInternal(m.content);
        break;
      }
      case "todo": {
        const t = getTodoContent();
        setTitleInternal(t.title);
        setContentInternal(t.content);
        break;
      }
      case "table":
        setContentInternal(getTableContent());
        break;
      case "project_overview": {
        const p = getProjectOverviewContent();
        setTitleInternal(p.title);
        setContentInternal(p.content);
        break;
      }
    }
  };

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
      return { isUnique: data.isUnique, suggestedTitle: data.suggestedTitle };
    } catch {
      return { isUnique: true };
    }
  };

  return {
    // State
    title, setTitle, content, setContent, tags, setTags,
    pageStyles, lastSavedAt, isSaving, showStarterOptions,
    isNewDoc, docId, document, isLoading,
    openCommentsCount, duplicateError, titleRequiredError, category,

    // Permission states
    canEdit, isViewOnly, isCommentOnly, canEditAndComment, hasNoAccess,
    userPermission: document?.userPermission,

    // Actions
    handleSave, handleStyleChange, saveDocumentForComment,
    applyTemplate, navigate, checkTitleAvailability,

    // Mutation states
    isPending: createMutation.isPending,
  };
}
