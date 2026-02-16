import { cn } from '@/lib/utils';
import { AlignJustify, Maximize2 } from 'lucide-react';
import type { PageStyles } from './types';

interface PageWidthSectionProps {
  pageWidth: PageStyles['pageWidth'];
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function PageWidthSection({ pageWidth, onStyleChange }: PageWidthSectionProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
        Page width
      </label>
      <div className="grid grid-cols-2 gap-2 max-md:gap-1.5">
        <button
          onClick={() => onStyleChange({ pageWidth: 'default' })}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border transition-all",
            "p-3 max-md:p-2.5",
            "active:scale-[0.97]",
            pageWidth === 'default'
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-100 dark:shadow-none"
              : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
          data-testid="page-width-default"
        >
          <AlignJustify className={cn(
            "h-4 w-4 max-md:h-3.5 max-md:w-3.5",
            pageWidth === 'default' ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"
          )} />
          <span className={cn(
            "text-sm max-md:text-xs",
            pageWidth === 'default'
              ? "text-violet-600 dark:text-violet-400 font-medium"
              : "text-gray-600 dark:text-gray-400"
          )}>
            Default
          </span>
        </button>
        <button
          onClick={() => onStyleChange({ pageWidth: 'full' })}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border transition-all",
            "p-3 max-md:p-2.5",
            "active:scale-[0.97]",
            pageWidth === 'full'
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm shadow-violet-100 dark:shadow-none"
              : "border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}
          data-testid="page-width-full"
        >
          <Maximize2 className={cn(
            "h-4 w-4 max-md:h-3.5 max-md:w-3.5",
            pageWidth === 'full' ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-gray-500"
          )} />
          <span className={cn(
            "text-sm max-md:text-xs",
            pageWidth === 'full'
              ? "text-violet-600 dark:text-violet-400 font-medium"
              : "text-gray-600 dark:text-gray-400"
          )}>
            Full width
          </span>
        </button>
      </div>
    </div>
  );
}
