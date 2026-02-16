import { cn } from '@/lib/utils';
import { Table } from 'lucide-react';
import { TABLE_OPTIONS } from './types';

interface InsertTableSectionProps {
  onInsertTable: (rows: number, cols: number) => void;
}

export function InsertTableSection({ onInsertTable }: InsertTableSectionProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
        Insert Table
      </label>
      <div className="grid grid-cols-2 max-md:grid-cols-5 gap-2 max-md:gap-1.5">
        {TABLE_OPTIONS.map((table) => (
          <button
            key={table.label}
            onClick={() => onInsertTable(table.rows, table.cols)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700/60 transition-all",
              "p-3 max-md:p-2",
              "hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20",
              "active:scale-[0.95]"
            )}
          >
            <Table className="h-5 w-5 max-md:h-4 max-md:w-4 text-gray-400 dark:text-gray-500 mb-1 max-md:mb-0.5" />
            <span className="text-xs max-md:text-[9px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {table.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
