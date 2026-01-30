import { Table } from 'lucide-react';
import { TABLE_OPTIONS } from './types';

interface InsertTableSectionProps {
  onInsertTable: (rows: number, cols: number) => void;
}

export function InsertTableSection({ onInsertTable }: InsertTableSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
        Insert Table
      </label>
      <div className="grid grid-cols-2 gap-2">
        {TABLE_OPTIONS.map((table) => (
          <button
            key={table.label}
            onClick={() => onInsertTable(table.rows, table.cols)}
            className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <Table className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{table.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
