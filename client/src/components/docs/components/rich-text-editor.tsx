import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  UnderlineIcon, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  CheckSquare,
  Minus,
  Columns2,
  Type,
  Plus,
  X,
  Table as TableIcon,
  Code,
  Quote,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline.extend({ name: 'customUnderline' }).configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      Link.extend({ name: 'customLink' }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 p-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none p-0',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-1',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write or type / for commands...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      
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
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const insertBlock = (type: string) => {
    // Remove the slash
    const { from } = editor.state.selection;
    editor.chain().deleteRange({ from: from - 1, to: from }).run();

    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'h1':
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case 'h4':
        editor.chain().focus().setHeading({ level: 4 }).run();
        break;
      case 'bullet':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'numbered':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'checklist':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'divider':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case '2-column':
        editor.chain().focus().insertContent('<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;"><div style="border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem;"><p>Column 1</p></div><div style="border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem;"><p>Column 2</p></div></div>').run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
    }
    setShowSlashMenu(false);
  };

  const MenuButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-7 w-7 p-0",
        active && "bg-gray-200 dark:bg-gray-700"
      )}
    >
      {children}
    </Button>
  );

  const slashCommands = [
    {
      category: 'TEXT',
      items: [
        { icon: <Type className="h-4 w-4" />, label: 'Normal text', action: () => insertBlock('paragraph') },
        { icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', action: () => insertBlock('h1') },
        { icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', action: () => insertBlock('h2') },
        { icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', action: () => insertBlock('h3') },
        { icon: <Heading4 className="h-4 w-4" />, label: 'Heading 4', action: () => insertBlock('h4') },
        { icon: <CheckSquare className="h-4 w-4" />, label: 'Checklist', action: () => insertBlock('checklist') },
        { icon: <List className="h-4 w-4" />, label: 'Bulleted list', action: () => insertBlock('bullet') },
        { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered list', action: () => insertBlock('numbered') },
      ]
    },
    {
      category: 'INLINE',
      items: [
        { icon: <Code className="h-4 w-4" />, label: 'Code block', action: () => insertBlock('code') },
        { icon: <Quote className="h-4 w-4" />, label: 'Block quote', action: () => insertBlock('quote') },
        { icon: <Minus className="h-4 w-4" />, label: 'Divider', action: () => insertBlock('divider') },
      ]
    },
    {
      category: 'SUGGESTIONS',
      items: [
        { icon: <TableIcon className="h-4 w-4" />, label: 'Table', action: () => insertBlock('table') },
        { icon: <Columns2 className="h-4 w-4" />, label: 'Columns', action: () => insertBlock('2-column') },
      ]
    }
  ];

  return (
    <div className="relative bg-white dark:bg-gray-800">
      {/* Bubble Menu for text selection */}
      {editor && (
        <BubbleMenu editor={editor} options={{ offset: 6, placement: 'top' }}>
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </MenuButton>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </MenuButton>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
          </div>
        </BubbleMenu>
      )}

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 w-72 max-h-96 overflow-y-auto"
          style={{ top: `${slashMenuPosition.top}px`, left: `${slashMenuPosition.left}px` }}
        >
          {slashCommands.map((category, categoryIdx) => (
            <div key={categoryIdx} className={categoryIdx > 0 ? 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-700' : ''}>
              <div className="px-3 py-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{category.category}</span>
              </div>
              <div className="space-y-0.5 px-1">
                {category.items.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
                    data-testid={`slash-command-${cmd.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">{cmd.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Controls */}
      {editor.isActive('table') && (
        <div className="absolute top-0 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-2 flex gap-1 mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add column before"
            className="h-7 px-2 text-xs"
          >
            + Col
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Add row before"
            className="h-7 px-2 text-xs"
          >
            + Row
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete column"
            className="h-7 px-2 text-xs"
          >
            - Col
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete row"
            className="h-7 px-2 text-xs"
          >
            - Row
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete table"
            className="h-7 px-2 text-xs text-red-600"
          >
            Delete Table
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[500px]"
        data-testid="rich-text-editor"
      />

      {/* Custom styles for empty state and checkboxes */}
      <style>{`
        .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: start;
          gap: 0.5rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        
        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          margin-top: 0.25rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div > p {
          text-decoration: line-through;
          color: #9ca3af;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1rem 0;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75rem 0;
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .ProseMirror h4 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
        }

        .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          font-family: 'JetBrainsMono', 'Courier New', Courier, monospace;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror code {
          background: #1e293b;
          color: #e2e8f0;
          padding: 0.1em 0.3em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'JetBrainsMono', 'Courier New', Courier, monospace;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .dark .ProseMirror blockquote {
          color: #9ca3af;
          border-left-color: #60a5fa;
        }

        .dark .ProseMirror pre {
          background: #0f172a;
        }

        .dark .ProseMirror code {
          background: #0f172a;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        .dark .ProseMirror hr {
          border-top-color: #374151;
        }
      `}</style>
    </div>
  );
}
