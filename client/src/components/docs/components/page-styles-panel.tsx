import { X, ChevronRight, Paintbrush } from 'lucide-react';
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
    <>
      {/* Backdrop overlay - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          // Base styles
          "fixed bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-in-out",
          // Desktop: right sidebar slide-in (unchanged behavior)
          "md:right-0 md:top-0 md:h-full md:w-96 md:border-l md:border-gray-200 md:dark:border-gray-700",
          isOpen
            ? "md:translate-x-0 md:z-50"
            : "md:translate-x-full md:pointer-events-none md:z-20",
          // Mobile: bottom sheet style (ClickUp-like)
          "max-md:inset-x-0 max-md:bottom-0 max-md:w-full max-md:max-h-[85vh] max-md:rounded-t-2xl max-md:shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
          isOpen
            ? "max-md:translate-y-0 max-md:z-50"
            : "max-md:translate-y-full max-md:pointer-events-none max-md:z-20"
        )}
        data-testid="page-styles-panel"
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 max-md:py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center max-md:w-6 max-md:h-6">
              <Paintbrush className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 max-md:h-3 max-md:w-3" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm max-md:text-[13px]">
              Page Styles
            </h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            data-testid="button-close-page-styles"
          >
            {/* X on mobile, ChevronRight on desktop */}
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400 md:hidden" />
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden md:block" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 max-md:p-3 space-y-5 max-md:space-y-4 overscroll-contain">
          <FontFamilySection fontStyle={styles.fontStyle} onStyleChange={onStyleChange} />
          <FontSizeSection fontSize={styles.fontSize} onStyleChange={onStyleChange} />
          <PageWidthSection pageWidth={styles.pageWidth} onStyleChange={onStyleChange} />

          {/* Color Styling Tables */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
              Color Styles
            </label>
            <div className="space-y-3 max-md:space-y-2">
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

          {/* Bottom safe area padding for mobile */}
          <div className="h-2 md:hidden" />
        </div>
      </div>
    </>
  );
}
