import type { PageStyles } from './types';
import { COLOR_PRESETS } from './types';

interface ColorPresetsSectionProps {
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function ColorPresetsSection({ onStyleChange }: ColorPresetsSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
        Color Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onStyleChange(preset.styles)}
            className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            <div className="flex gap-1 mb-2">
              {preset.swatches.map((swatch, i) => (
                <div key={i} className={`w-4 h-4 rounded ${swatch}`} />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
