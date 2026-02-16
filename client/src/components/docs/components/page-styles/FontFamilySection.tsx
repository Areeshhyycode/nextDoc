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
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
        Font Family
      </label>
      <div className="grid grid-cols-2 max-md:grid-cols-3 gap-2 max-md:gap-1.5">
        {FONT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStyleChange({ fontStyle: opt.value })}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border transition-all",
              "p-3 max-md:p-2",
              "active:scale-[0.97]",
              fontStyle === opt.value
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-100 dark:shadow-none"
                : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
            data-testid={opt.testId}
          >
            <span
              className={cn(
                "text-xl max-md:text-base mb-1 max-md:mb-0.5 text-gray-800 dark:text-gray-200",
                fontStyle === opt.value && "text-violet-700 dark:text-violet-300",
                opt.className
              )}
              style={opt.style}
            >
              {opt.preview}
            </span>
            <span className={cn(
              "text-xs max-md:text-[10px] leading-tight",
              fontStyle === opt.value
                ? "text-violet-600 dark:text-violet-400 font-medium"
                : "text-gray-500 dark:text-gray-400"
            )}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
