import { Editor } from '@tiptap/react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  CheckSquare,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Table as TableIcon,
  Columns2,
} from 'lucide-react';

interface SlashMenuPosition {
  top: number;
  left: number;
}

interface EditorSlashMenuProps {
  editor: Editor;
  position: SlashMenuPosition;
  onClose: () => void;
}

type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bullet'
  | 'numbered'
  | 'checklist'
  | 'divider'
  | 'table-2x2'
  | 'table-2x3'
  | 'table-3x2'
  | 'table-3x3'
  | 'table-3x4'
  | 'table-4x3'
  | 'table-4x4'
  | 'table-3x5'
  | 'table-5x3'
  | 'table-5x5'
  | '2-column'
  | 'code'
  | 'quote';

function insertBlock(editor: Editor, type: BlockType, onClose: () => void) {
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
    case 'table-2x2':
      editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
      break;
    case 'table-2x3':
      editor.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: true }).run();
      break;
    case 'table-3x2':
      editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
      break;
    case 'table-3x3':
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      break;
    case 'table-3x4':
      editor.chain().focus().insertTable({ rows: 3, cols: 4, withHeaderRow: true }).run();
      break;
    case 'table-4x3':
      editor.chain().focus().insertTable({ rows: 4, cols: 3, withHeaderRow: true }).run();
      break;
    case 'table-4x4':
      editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run();
      break;
    case 'table-3x5':
      editor.chain().focus().insertTable({ rows: 3, cols: 5, withHeaderRow: true }).run();
      break;
    case 'table-5x3':
      editor.chain().focus().insertTable({ rows: 5, cols: 3, withHeaderRow: true }).run();
      break;
    case 'table-5x5':
      editor.chain().focus().insertTable({ rows: 5, cols: 5, withHeaderRow: true }).run();
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
  onClose();
}

interface SlashCommand {
  icon: React.ReactNode;
  label: string;
  type: BlockType;
}

interface SlashCommandCategory {
  category: string;
  items: SlashCommand[];
}

const slashCommands: SlashCommandCategory[] = [
  {
    category: 'TEXT',
    items: [
      { icon: <Type className="h-4 w-4" />, label: 'Normal text', type: 'paragraph' },
      { icon: <Heading1 className="h-4 w-4" />, label: 'Heading 1', type: 'h1' },
      { icon: <Heading2 className="h-4 w-4" />, label: 'Heading 2', type: 'h2' },
      { icon: <Heading3 className="h-4 w-4" />, label: 'Heading 3', type: 'h3' },
      { icon: <Heading4 className="h-4 w-4" />, label: 'Heading 4', type: 'h4' },
      { icon: <CheckSquare className="h-4 w-4" />, label: 'Checklist', type: 'checklist' },
      { icon: <List className="h-4 w-4" />, label: 'Bulleted list', type: 'bullet' },
      { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered list', type: 'numbered' },
    ],
  },
  {
    category: 'INLINE',
    items: [
      { icon: <Code className="h-4 w-4" />, label: 'Code block', type: 'code' },
      { icon: <Quote className="h-4 w-4" />, label: 'Block quote', type: 'quote' },
      { icon: <Minus className="h-4 w-4" />, label: 'Divider', type: 'divider' },
    ],
  },
  {
    category: 'TABLE',
    items: [
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 2x2', type: 'table-2x2' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 2x3', type: 'table-2x3' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 3x2', type: 'table-3x2' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 3x3', type: 'table-3x3' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 3x4', type: 'table-3x4' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 4x3', type: 'table-4x3' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 4x4', type: 'table-4x4' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 3x5', type: 'table-3x5' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 5x3', type: 'table-5x3' },
      { icon: <TableIcon className="h-4 w-4" />, label: 'Table 5x5', type: 'table-5x5' },
    ],
  },
  {
    category: 'LAYOUT',
    items: [
      { icon: <Columns2 className="h-4 w-4" />, label: 'Columns', type: '2-column' },
    ],
  },
];

export function EditorSlashMenu({ editor, position, onClose }: EditorSlashMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 w-72 max-h-96 overflow-y-auto"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {slashCommands.map((category, categoryIdx) => (
        <div
          key={categoryIdx}
          className={categoryIdx > 0 ? 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-700' : ''}
        >
          <div className="px-3 py-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {category.category}
            </span>
          </div>
          <div className="space-y-0.5 px-1">
            {category.items.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => insertBlock(editor, cmd.type, onClose)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
                data-testid={`slash-command-${cmd.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {cmd.icon}
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
