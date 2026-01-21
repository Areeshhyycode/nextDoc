import { useState } from "react";
import { RichTextEditor } from "@/components/docs/components/rich-text-editor";
import { CommentsPanel } from "@/components/docs/components/comments-panel";
import { PageStylesPanel } from "@/components/docs/components/page-styles-panel";
import { SidebarIcons } from "@/components/docs/components/sidebar-icons";
import {
  EditorHeader,
  StarterOptions,
  EditorLoadingState,
  useDocument,
} from "@/components/docs/editor";
import { cn } from "@/lib/utils";

export default function DocEditorPage() {
  const [openPanel, setOpenPanel] = useState<"comments" | "pageStyles" | null>(null);

  const {
    title,
    setTitle,
    content,
    setContent,
    pageStyles,
    lastSavedAt,
    isSaving,
    showStarterOptions,
    isNewDoc,
    docId,
    document,
    isLoading,
    openCommentsCount,
    handleSave,
    handleStyleChange,
    saveDocumentForComment,
    applyTemplate,
    navigate,
    isPending,
    duplicateError,
  } = useDocument();

  // Loading state
  if (isLoading && !isNewDoc) {
    return <EditorLoadingState />;
  }

  // Style helper functions
  const getFontClass = () => {
    const fontMap = {
      system: "",
      serif: "font-serif",
      mono: "font-mono",
    };
    return fontMap[pageStyles.fontStyle];
  };

  const getFontSizeClass = () => {
    const sizeMap = {
      small: "text-sm",
      default: "text-base",
      large: "text-lg",
    };
    return sizeMap[pageStyles.fontSize];
  };

  const getWidthClass = () => {
    const widthMap = {
      default: "max-w-4xl",
      full: "max-w-full px-8",
    };
    return widthMap[pageStyles.pageWidth];
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative">
      {/* Header */}
      <EditorHeader
        title={title}
        onTitleChange={setTitle}
        onNavigateBack={() => navigate("/docs")}
        isNewDoc={isNewDoc}
        isSaving={isSaving}
        isPending={isPending}
        lastSavedAt={lastSavedAt}
        showLastModified={pageStyles.showLastModified}
        documentUpdatedAt={document?.updatedAt}
        onSave={handleSave}
        duplicateError={duplicateError}
      />

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto py-8", getWidthClass())}>
          {/* Starter Options */}
          {showStarterOptions && isNewDoc && !content && (
            <StarterOptions onSelectTemplate={applyTemplate} />
          )}

          {/* Rich Text Editor */}
          <div className={cn(getFontClass(), getFontSizeClass())}>
            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      <CommentsPanel
        documentId={docId}
        isOpen={openPanel === "comments"}
        onToggle={() =>
          setOpenPanel(openPanel === "comments" ? null : "comments")
        }
        onSaveDocument={saveDocumentForComment}
      />

      {/* Page Styles Panel */}
      <PageStylesPanel
        isOpen={openPanel === "pageStyles"}
        onToggle={() =>
          setOpenPanel(openPanel === "pageStyles" ? null : "pageStyles")
        }
        styles={pageStyles}
        onStyleChange={handleStyleChange}
      />

      {/* Sidebar Icons */}
      <SidebarIcons
        commentsOpen={openPanel === "comments"}
        pageStylesOpen={openPanel === "pageStyles"}
        onCommentsToggle={() => {
          setOpenPanel(openPanel === "comments" ? null : "comments");
        }}
        onPageStylesToggle={() => {
          setOpenPanel(openPanel === "pageStyles" ? null : "pageStyles");
        }}
        commentsCount={openCommentsCount}
        isNewDoc={isNewDoc}
        document={document ? { ...document, owner: null } : null}
      />
    </div>
  );
}
