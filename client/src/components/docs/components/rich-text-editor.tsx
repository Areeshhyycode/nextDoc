import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
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

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
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
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

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
}
