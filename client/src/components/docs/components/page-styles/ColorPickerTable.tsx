import type { PageStyles, ColorTableSection } from './types';

interface ColorPickerTableProps {
  section: ColorTableSection;
  styles: PageStyles;
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function ColorPickerTable({ section, styles, onStyleChange }: ColorPickerTableProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">{section.heading}</th>
            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Color</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {section.rows.map((row) => (
            <tr key={row.styleKey} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">{row.label}</td>
              <td className="px-3 py-2">
                <input
                  type="color"
                  value={styles[row.styleKey] as string}
                  onChange={(e) => onStyleChange({ [row.styleKey]: e.target.value })}
                  className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
