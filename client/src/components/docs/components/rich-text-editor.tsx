import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  createEditorExtensions,
  EditorBubbleMenu,
  EditorSlashMenu,
  EditorStyles,
} from './editor';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export interface RichTextEditorRef {
  insertTable: (rows: number, cols: number) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor({ content, onChange, editable = true }, ref) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: createEditorExtensions({ editable }),
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Check for slash command
      const { state } = editor;
      const { from } = state.selection;
      const text = state.doc.textBetween(from - 1, from);

      if (text === '/') {
        const coords = editor.view.coordsAtPos(from);
        setSlashMenuPosition({ top: coords.top + 25, left: coords.left });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-base dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-12 py-6',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    // Normalize both sides by stripping whitespace between tags so that
    // "<p>a</p>\n<p>b</p>" and "<p>a</p><p>b</p>" are treated as equal.
    // This prevents an infinite re-render loop where setContent triggers
    // onUpdate which changes content which triggers this effect again.
    const normalize = (html: string) => html.replace(/>\s+</g, '><').trim();
    if (normalize(content || '') !== normalize(editor.getHTML())) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Update editable state when prop changes
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
  }), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative bg-white dark:bg-gray-800">
      {/* Bubble Menu for text selection */}
      <EditorBubbleMenu editor={editor} />

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <EditorSlashMenu
          editor={editor}
          position={slashMenuPosition}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[500px]"
        data-testid="rich-text-editor"
      />

      {/* Custom styles for empty state and checkboxes */}
      <EditorStyles />
    </div>
  );
});
