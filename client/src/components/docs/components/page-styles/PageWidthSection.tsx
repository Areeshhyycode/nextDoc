import { cn } from '@/lib/utils';
import type { PageStyles } from './types';

interface PageWidthSectionProps {
  pageWidth: PageStyles['pageWidth'];
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function PageWidthSection({ pageWidth, onStyleChange }: PageWidthSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
        Page width
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onStyleChange({ pageWidth: 'default' })}
          className={cn(
            "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
            pageWidth === 'default'
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          data-testid="page-width-default"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">Default</span>
        </button>
        <button
          onClick={() => onStyleChange({ pageWidth: 'full' })}
          className={cn(
            "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
            pageWidth === 'full'
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
          data-testid="page-width-full"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">Full width</span>
        </button>
      </div>
    </div>
  );
}
