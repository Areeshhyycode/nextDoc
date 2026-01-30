import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
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
  Heading5,
  Heading6,
  Type,
  Table,
} from 'lucide-react';
import { MenuButton } from './editor-toolbar';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditorBubbleMenuProps {
  editor: Editor;
}

const FONT_FAMILIES = [
  { label: 'System Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
];

const TABLE_OPTIONS = [
  { label: '2x2', rows: 2, cols: 2 },
  { label: '2x3', rows: 2, cols: 3 },
  { label: '3x2', rows: 3, cols: 2 },
  { label: '3x3', rows: 3, cols: 3 },
  { label: '3x4', rows: 3, cols: 4 },
  { label: '4x3', rows: 4, cols: 3 },
  { label: '4x4', rows: 4, cols: 4 },
  { label: '3x5', rows: 3, cols: 5 },
  { label: '5x3', rows: 5, cols: 3 },
  { label: '5x5', rows: 5, cols: 5 },
];

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  const currentFont = editor.getAttributes('textStyle').fontFamily || '';
  const currentFontLabel = FONT_FAMILIES.find(f => f.value === currentFont)?.label || 'System Default';

  return (
    <BubbleMenu editor={editor} options={{ offset: 6, placement: 'top' }}>
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Font Family Dropdown */}
        <DropdownMenu open={fontMenuOpen} onOpenChange={setFontMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Font Family"
            >
              <Type className="h-3.5 w-3.5" />
              <span className="max-w-[80px] truncate">{currentFontLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {FONT_FAMILIES.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => {
                  if (font.value === '') {
                    editor.chain().focus().unsetFontFamily().run();
                  } else {
                    editor.chain().focus().setFontFamily(font.value).run();
                  }
                  setFontMenuOpen(false);
                }}
                className={currentFont === font.value ? 'bg-gray-100 dark:bg-gray-700' : ''}
                style={{ fontFamily: font.value || undefined }}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Text Formatting */}
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

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>
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
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={editor.isActive('heading', { level: 4 })}
          title="Heading 4"
        >
          <Heading4 className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          active={editor.isActive('heading', { level: 5 })}
          title="Heading 5"
        >
          <Heading5 className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          active={editor.isActive('heading', { level: 6 })}
          title="Heading 6"
        >
          <Heading6 className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Lists */}
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

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Table Dropdown */}
        <DropdownMenu open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {TABLE_OPTIONS.map((table) => (
              <DropdownMenuItem
                key={table.label}
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: table.rows, cols: table.cols, withHeaderRow: true }).run();
                  setTableMenuOpen(false);
                }}
                className="cursor-pointer"
              >
                <Table className="h-4 w-4 mr-2" />
                {table.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BubbleMenu>
  );
}
