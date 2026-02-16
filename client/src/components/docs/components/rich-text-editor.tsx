import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
  createEditorExtensions,
  EditorBubbleMenu,
  EditorSlashMenu,
  EditorStyles,
} from './editor';
import { YjsCollaboration } from './editor/collaboration-extension';
import { YjsCollaborationCursor } from './editor/collaboration-cursor-extension';
import type * as Y from 'yjs';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  collaboration?: {
    document: Y.Doc;
    provider: any;
    user: { name: string; color: string };
  };
}

export interface RichTextEditorRef {
  insertTable: (rows: number, cols: number) => void;
  getEditor: () => import('@tiptap/react').Editor | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor({ content, onChange, editable = true, collaboration }, ref) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });

  // Build collaboration extensions only when collaboration is active.
  const collaborationData = useMemo(() => {
    if (!collaboration) return null;

    const ydoc = collaboration.document;
    if (!ydoc) return null;

    const fragment = ydoc.getXmlFragment('default');
    if (!fragment || !fragment.doc) return null;

    const extensions: any[] = [
      YjsCollaboration.configure({ fragment }),
    ];

    if (collaboration.provider?.awareness) {
      extensions.push(
        YjsCollaborationCursor.configure({
          provider: collaboration.provider,
          user: collaboration.user,
        }),
      );
    }

    return { extensions };
  }, [collaboration]);

  const editor = useEditor({
    extensions: createEditorExtensions({ editable, collaborationExtensions: collaborationData?.extensions }),
    // Always seed from HTML content. Hocuspocus fetch returns null (no stored yjsState),
    // so the Y.Doc is always empty and needs to be populated from the saved HTML.
    content: content || '',
    editable,
    onUpdate: ({ editor, transaction }) => {
      // Skip remote Yjs changes — only push local edits to React state.
      // Remote changes (from other collaborators) should NOT trigger autosave,
      // which would overwrite lastUpdatedBy with the current user.
      const isRemote = transaction.getMeta('y-sync$');
      if (isRemote) return;

      const html = editor.getHTML();
      onChange(html);

      // Slash menu detection (works in both modes)
      const { state } = editor;
      const { from } = state.selection;
      try {
        const text = state.doc.textBetween(from - 1, from);
        if (text === '/') {
          const coords = editor.view.coordsAtPos(from);
          setSlashMenuPosition({ top: coords.top + 25, left: coords.left });
          setShowSlashMenu(true);
        } else {
          setShowSlashMenu(false);
        }
      } catch {
        setShowSlashMenu(false);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] sm:min-h-[500px] px-3 sm:px-6 md:px-12 py-4 sm:py-6',
      },
    },
  });

  // Sync content from React state to editor — only in solo (non-collaboration) mode.
  // When Yjs collaboration is active, the Y.Doc is the source of truth.
  useEffect(() => {
    if (!editor || collaborationData) return;

    const normalize = (html: string) => html.replace(/>\s+</g, '><').trim();
    if (normalize(content || '') !== normalize(editor.getHTML())) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor, collaborationData]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useImperativeHandle(ref, () => ({
    insertTable: (rows: number, cols: number) => {
      if (editor) {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      }
    },
    getEditor: () => editor,
  }), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 overflow-hidden">
      <EditorBubbleMenu editor={editor} />

      {showSlashMenu && (
        <EditorSlashMenu
          editor={editor}
          position={slashMenuPosition}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      <EditorContent
        editor={editor}
        className="min-h-[200px] sm:min-h-[500px]"
        data-testid="rich-text-editor"
      />

      <EditorStyles />
    </div>
  );
});
