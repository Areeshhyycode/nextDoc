import { cn } from '@/lib/utils';
import type { PageStyles } from './types';
import { FONT_SIZE_OPTIONS } from './types';

interface FontSizeSectionProps {
  fontSize: PageStyles['fontSize'];
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function FontSizeSection({ fontSize, onStyleChange }: FontSizeSectionProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
        Font size
      </label>
      {/* Segmented control style on mobile, grid on desktop */}
      <div className="grid grid-cols-3 gap-2 max-md:gap-0 max-md:bg-gray-100 max-md:dark:bg-gray-800 max-md:rounded-xl max-md:p-1">
        {FONT_SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStyleChange({ fontSize: opt.value })}
            className={cn(
              "flex flex-col items-center justify-center transition-all",
              // Desktop: card style
              "p-3 rounded-xl border md:border",
              "max-md:border-0 max-md:p-2 max-md:rounded-lg",
              "active:scale-[0.97]",
              fontSize === opt.value
                ? cn(
                    "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-100 dark:shadow-none",
                    "max-md:bg-white max-md:dark:bg-gray-700 max-md:shadow-sm max-md:shadow-gray-200/50 max-md:dark:shadow-none"
                  )
                : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 max-md:bg-transparent"
            )}
            data-testid={opt.testId}
          >
            <span className={cn(
              opt.sizeClass,
              "mb-1 max-md:mb-0.5 text-gray-700 dark:text-gray-300",
              fontSize === opt.value && "text-violet-700 dark:text-violet-300"
            )}>
              Aa ≡
            </span>
            <span className={cn(
              "text-xs max-md:text-[10px] leading-tight",
              fontSize === opt.value
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
