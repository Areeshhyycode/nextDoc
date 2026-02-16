import type { PageStyles, ColorTableSection } from './types';

interface ColorPickerTableProps {
  section: ColorTableSection;
  styles: PageStyles;
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function ColorPickerTable({ section, styles, onStyleChange }: ColorPickerTableProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700/60 rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="bg-gray-50 dark:bg-gray-800/80 px-3 py-1.5 max-md:px-2.5 max-md:py-1 border-b border-gray-200 dark:border-gray-700/60">
        <span className="text-[11px] max-md:text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {section.heading}
        </span>
      </div>

      {/* Color rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {section.rows.map((row) => (
          <div
            key={row.styleKey}
            className="flex items-center justify-between px-3 py-2 max-md:px-2.5 max-md:py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <span className="text-sm max-md:text-xs text-gray-700 dark:text-gray-300">
              {row.label}
            </span>
            <div className="relative">
              {/* Color swatch preview circle */}
              <div
                className="w-7 h-7 max-md:w-6 max-md:h-6 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm overflow-hidden"
                style={{ backgroundColor: styles[row.styleKey] as string }}
              >
                <input
                  type="color"
                  value={styles[row.styleKey] as string}
                  onChange={(e) => onStyleChange({ [row.styleKey]: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
