import { useState, useEffect, useRef } from "react";
import { RichTextEditor, RichTextEditorRef } from "@/components/docs/components/rich-text-editor";
import { CommentsPanel } from "@/components/docs/components/comments-panel";
import { PageStylesPanel } from "@/components/docs/components/page-styles-panel";
import { SidebarIcons } from "@/components/docs/components/sidebar-icons";
import { NoAccessPage } from "@/components/docs/components/no-access-page";
import { PermissionBadge } from "@/components/docs/components/permission-badge";
import { PageTreeSidebar } from "@/components/docs/components/page-tree-sidebar";
import { AddPageDialog } from "@/components/docs/components/add-page-dialog";
import { EditorHeader, StarterOptions, EditorLoadingState, useDocument, useDocumentPages } from "@/components/docs/editor";
import { getFontClass, getFontSizeClass, getWidthClass } from "@/components/docs/utils/page-styles";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { cn } from "@/lib/utils";

export default function DocEditorPage() {
  const [openPanel, setOpenPanel] = useState<"comments" | "pageStyles" | null>(null);
  const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(false);
  const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [isSidebarCollapsed, , toggleSidebarCollapsed] = useSidebarCollapse();
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleInsertTable = (rows: number, cols: number) => {
    editorRef.current?.insertTable(rows, cols);
  };
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
    setIsAddingPage(true);
    try {
      // If this is a new unsaved document, save it first
      if (isNewDoc || !docId) {
        // Save document first, then the page will be added after redirect
        // Store page title in session storage to add after document is created
        sessionStorage.setItem('pendingPageTitle', pageTitle);
        await handleSave();
        return;
      }

      // Add page to current document - stay on same page, just open sidebar
      await addPage(pageTitle);
      // Open the pages sidebar to show the new page
      setIsPageSidebarOpen(true);
    } finally {
      setIsAddingPage(false);
    }
  };

  const handleOpenAddPageDialog = () => {
    setIsAddPageDialogOpen(true);
  };

  const handleNavigateToPage = (pageId: string) => {
    navigate(`/docs/${pageId}`);
  };

  // Check for pending page to add after document is saved
  useEffect(() => {
    const pendingPageTitle = sessionStorage.getItem('pendingPageTitle');
    if (pendingPageTitle && docId && !isNewDoc) {
      sessionStorage.removeItem('pendingPageTitle');
      // Add the pending page - stay on current doc, just open sidebar
      addPage(pendingPageTitle).then(() => {
        // Open the pages sidebar to show the new page
        setIsPageSidebarOpen(true);
      });
    }
  }, [docId, isNewDoc, addPage]);

  // Keyboard shortcut for toggling sidebar collapse (Ctrl/Cmd + \)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        if (isPageSidebarOpen) {
          toggleSidebarCollapsed();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPageSidebarOpen, toggleSidebarCollapsed]);

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
        isCollapsed={isSidebarCollapsed}
        onCollapseToggle={toggleSidebarCollapsed}
      />

      <EditorHeader
        title={title}
        onTitleChange={setTitle}
        onNavigateBack={() => navigate("/docs")}
        isNewDoc={isNewDoc}
        isSaving={isSaving}
        isPending={isPending}
        lastSavedAt={lastSavedAt}
        documentUpdatedAt={document?.updatedAt}
        onSave={canEdit ? handleSave : undefined}
        duplicateError={duplicateError}
        titleRequiredError={titleRequiredError}
        category={category}
        document={document}
        canEdit={canEdit}
      />

      <div className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        isPageSidebarOpen && (isSidebarCollapsed ? "ml-12" : "ml-64")
      )}>
        <div className={cn("mx-auto py-4 sm:py-8 px-3 sm:px-0", getWidthClass(pageStyles.pageWidth))}>
          {/* Show starter options for new empty documents */}
          {showStarterOptions && (
            <div className="pt-2 sm:pt-8 pb-2 sm:pb-4">
              <StarterOptions
                onSelectTemplate={applyTemplate}
              />
            </div>
          )}
          <div
            className={cn(getFontClass(pageStyles.fontStyle), getFontSizeClass(pageStyles.fontSize), "rounded-lg p-4")}
            style={{
              backgroundColor: pageStyles.backgroundColor,
              color: pageStyles.textColor,
            }}
          >
            <style>
              {`
                .ProseMirror h1 {
                  color: ${pageStyles.h1Color} !important;
                }
                .ProseMirror h2 {
                  color: ${pageStyles.h2Color} !important;
                }
                .ProseMirror h3 {
                  color: ${pageStyles.h3Color} !important;
                }
                .ProseMirror h4 {
                  color: ${pageStyles.h4Color} !important;
                }
                .ProseMirror h5 {
                  color: ${pageStyles.h5Color} !important;
                }
                .ProseMirror h6 {
                  color: ${pageStyles.h6Color} !important;
                }
                .ProseMirror a {
                  color: ${pageStyles.linkColor} !important;
                }
                .ProseMirror pre,
                .ProseMirror code {
                  background-color: ${pageStyles.codeBlockBg} !important;
                  color: ${pageStyles.codeBlockText} !important;
                }
                .ProseMirror blockquote {
                  background-color: ${pageStyles.blockquoteBg} !important;
                  color: ${pageStyles.blockquoteText} !important;
                  border-left-color: ${pageStyles.linkColor} !important;
                }
                .ProseMirror table {
                  border-color: ${pageStyles.tableBorderColor} !important;
                }
                .ProseMirror table th {
                  background-color: ${pageStyles.tableHeaderBg} !important;
                  border-color: ${pageStyles.tableBorderColor} !important;
                }
                .ProseMirror table td {
                  border-color: ${pageStyles.tableBorderColor} !important;
                }
              `}
            </style>
            <RichTextEditor ref={editorRef} content={content} onChange={setContent} editable={canEdit} />
          </div>
        </div>
      </div>

      <CommentsPanel documentId={docId} isOpen={openPanel === "comments"} onToggle={() => togglePanel("comments")} onSaveDocument={saveDocumentForComment} />
      <PageStylesPanel isOpen={openPanel === "pageStyles"} onToggle={() => togglePanel("pageStyles")} styles={pageStyles} onStyleChange={handleStyleChange} onInsertTable={handleInsertTable} />
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
        canAddPage={canEdit}
        onAddPage={handleOpenAddPageDialog}
      />

      {/* Add Page Dialog */}
      <AddPageDialog
        isOpen={isAddPageDialogOpen}
        onClose={() => setIsAddPageDialogOpen(false)}
        onAddPage={handleAddPage}
        isSubmitting={isAddingPage}
        documentTitle={rootDocumentTitle || title}
      />
    </div>
  );
}
