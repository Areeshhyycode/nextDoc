import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_TABLES } from './page-styles/types';
import type { PageStylesPanelProps } from './page-styles/types';
import { FontFamilySection } from './page-styles/FontFamilySection';
import { FontSizeSection } from './page-styles/FontSizeSection';
import { PageWidthSection } from './page-styles/PageWidthSection';
import { ColorPickerTable } from './page-styles/ColorPickerTable';
import { ColorPresetsSection } from './page-styles/ColorPresetsSection';
import { InsertTableSection } from './page-styles/InsertTableSection';

// Re-export public API for backward compatibility
export type { PageStyles, PageStylesPanelProps } from './page-styles/types';

export function PageStylesPanel({ isOpen, onToggle, styles, onStyleChange, onInsertTable }: PageStylesPanelProps) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0 z-50" : "translate-x-full pointer-events-none z-20"
      )}
      data-testid="page-styles-panel"
    >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between relative bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Page Styles</h3>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            data-testid="button-close-page-styles"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <FontFamilySection fontStyle={styles.fontStyle} onStyleChange={onStyleChange} />
          <FontSizeSection fontSize={styles.fontSize} onStyleChange={onStyleChange} />
          <PageWidthSection pageWidth={styles.pageWidth} onStyleChange={onStyleChange} />

          {/* Color Styling Tables */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Color Styles
            </label>
            <div className="space-y-4">
              {COLOR_TABLES.map((section) => (
                <ColorPickerTable
                  key={section.heading}
                  section={section}
                  styles={styles}
                  onStyleChange={onStyleChange}
                />
              ))}
            </div>
          </div>

          <ColorPresetsSection onStyleChange={onStyleChange} />

          {onInsertTable && <InsertTableSection onInsertTable={onInsertTable} />}
        </div>
      </div>
  );
}
