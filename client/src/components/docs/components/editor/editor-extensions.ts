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
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';

export interface EditorExtensionsOptions {
  editable: boolean;
}

export function createEditorExtensions({ editable }: EditorExtensionsOptions) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    TextStyle,
    FontFamily.configure({
      types: ['textStyle'],
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
      placeholder: editable ? 'Type / for commands, or start writing...' : '',
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-node-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
    }),
  ];
}