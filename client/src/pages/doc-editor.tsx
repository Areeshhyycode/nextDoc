import { useState } from "react";
import { RichTextEditor } from "@/components/docs/components/rich-text-editor";
import { CommentsPanel } from "@/components/docs/components/comments-panel";
import { PageStylesPanel } from "@/components/docs/components/page-styles-panel";
import { SidebarIcons } from "@/components/docs/components/sidebar-icons";
import { NoAccessPage } from "@/components/docs/components/no-access-page";
import { PermissionBadge } from "@/components/docs/components/permission-badge";
import { PageTreeSidebar } from "@/components/docs/components/page-tree-sidebar";
import { EditorHeader, StarterOptions, EditorLoadingState, useDocument, useDocumentPages } from "@/components/docs/editor";
import { getFontClass, getFontSizeClass, getWidthClass } from "@/components/docs/utils/page-styles";
import { cn } from "@/lib/utils";

export default function DocEditorPage() {
  const [openPanel, setOpenPanel] = useState<"comments" | "pageStyles" | null>(null);
  const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(false);
  const {
    title, setTitle, content, setContent, pageStyles, lastSavedAt, isSaving,
    showStarterOptions, isNewDoc, docId, document, isLoading, openCommentsCount,
    handleSave, handleStyleChange, saveDocumentForComment, applyTemplate,
    navigate, isPending, duplicateError, titleRequiredError, canEdit, hasNoAccess, category,
  } = useDocument();

  // Use the document pages hook for page tree - uses root document for hierarchy
  const {
    pages,
    totalPagesCount,
    isLoading: isPagesLoading,
    addPage,
    rootDocumentId,
    rootDocumentTitle,
  } = useDocumentPages(docId);

  const togglePanel = (panel: "comments" | "pageStyles") => setOpenPanel(openPanel === panel ? null : panel);

  const handleAddPage = async (pageTitle: string) => {
    const newPage = await addPage(pageTitle);
    if (newPage) {
      // Navigate to the newly created page
      navigate(`/docs/${newPage.id}`);
    }
  };

  const handleNavigateToPage = (pageId: string) => {
    navigate(`/docs/${pageId}`);
  };

  if (isLoading && !isNewDoc) return <EditorLoadingState />;
  if (hasNoAccess) return <NoAccessPage onNavigateBack={() => navigate("/docs")} />;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative">
      {document?.userPermission && <PermissionBadge permission={document.userPermission} />}

      {/* Page Tree Sidebar - Always shows from root document */}
      <PageTreeSidebar
        isOpen={isPageSidebarOpen}
        onToggle={() => setIsPageSidebarOpen(!isPageSidebarOpen)}
        documentId={rootDocumentId}
        documentTitle={rootDocumentTitle || title}
        pages={pages}
        isLoading={isPagesLoading}
        canEdit={canEdit}
        onAddPage={handleAddPage}
        onNavigateToPage={handleNavigateToPage}
        currentPageId={docId || undefined}
      />

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
        onSave={canEdit ? handleSave : undefined}
        duplicateError={duplicateError}
        titleRequiredError={titleRequiredError}
        category={category}
        document={document}
        canEdit={canEdit}
      />

      <div className={cn("flex-1 overflow-y-auto", isPageSidebarOpen && "ml-64")}>
        <div className={cn("mx-auto py-8", getWidthClass(pageStyles.pageWidth))}>
          {/* Show starter options for new empty documents */}
          {showStarterOptions && (
            <div className="pt-8 pb-4">
              <StarterOptions onSelectTemplate={applyTemplate} />
            </div>
          )}
          <div className={cn(getFontClass(pageStyles.fontStyle), getFontSizeClass(pageStyles.fontSize))}>
            <RichTextEditor content={content} onChange={setContent} editable={canEdit} />
          </div>
        </div>
      </div>

      <CommentsPanel documentId={docId} isOpen={openPanel === "comments"} onToggle={() => togglePanel("comments")} onSaveDocument={saveDocumentForComment} />
      <PageStylesPanel isOpen={openPanel === "pageStyles"} onToggle={() => togglePanel("pageStyles")} styles={pageStyles} onStyleChange={handleStyleChange} />
      <SidebarIcons
        commentsOpen={openPanel === "comments"}
        pageStylesOpen={openPanel === "pageStyles"}
        pagesOpen={isPageSidebarOpen}
        onCommentsToggle={() => togglePanel("comments")}
        onPageStylesToggle={() => togglePanel("pageStyles")}
        onPagesToggle={() => setIsPageSidebarOpen(!isPageSidebarOpen)}
        commentsCount={openCommentsCount}
        pagesCount={totalPagesCount}
        isNewDoc={isNewDoc}
        document={document ? { ...document, owner: null } : null}
      />
    </div>
  );
}
