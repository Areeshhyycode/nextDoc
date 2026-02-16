import { cn } from '@/lib/utils';
import type { PageStyles } from './types';
import { COLOR_PRESETS } from './types';

interface ColorPresetsSectionProps {
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function ColorPresetsSection({ onStyleChange }: ColorPresetsSectionProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 max-md:mb-2 max-md:text-[10px]">
        Color Presets
      </label>
      {/* Desktop: 2-col grid | Mobile: horizontal scroll strip */}
      <div className="grid grid-cols-2 gap-2 max-md:flex max-md:gap-2 max-md:overflow-x-auto max-md:pb-1 max-md:-mx-3 max-md:px-3 scrollbar-none">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onStyleChange(preset.styles)}
            className={cn(
              "flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-700/60 transition-all",
              "p-3 max-md:p-2.5 max-md:min-w-[80px] max-md:flex-shrink-0",
              "hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10",
              "active:scale-[0.97]"
            )}
          >
            <div className="flex gap-1 mb-2 max-md:mb-1.5">
              {preset.swatches.map((swatch, i) => (
                <div key={i} className={`w-4 h-4 max-md:w-3.5 max-md:h-3.5 rounded-full ${swatch}`} />
              ))}
            </div>
            <span className="text-xs max-md:text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
