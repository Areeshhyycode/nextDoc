import { cn } from '@/lib/utils';
import type { PageStyles } from './types';
import { FONT_OPTIONS } from './types';

interface FontFamilySectionProps {
  fontStyle: PageStyles['fontStyle'];
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function FontFamilySection({ fontStyle, onStyleChange }: FontFamilySectionProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
        Font Family
      </label>
      <div className="grid grid-cols-2 gap-2">
        {FONT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStyleChange({ fontStyle: opt.value })}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
              fontStyle === opt.value
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            data-testid={opt.testId}
          >
            <span className={cn("text-xl mb-1", opt.className)} style={opt.style}>
              {opt.preview}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
