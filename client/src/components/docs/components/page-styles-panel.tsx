import { useState } from 'react';
import { ChevronLeft, ChevronRight, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface PageStyles {
  fontStyle: 'system' | 'serif' | 'mono' | 'inter' | 'roboto' | 'playfair';
  fontSize: 'small' | 'default' | 'large';
  pageWidth: 'default' | 'full';
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  h1Color: string;
  h2Color: string;
  h3Color: string;
  h4Color: string;
  h5Color: string;
  h6Color: string;
  linkColor: string;
  codeBlockBg: string;
  codeBlockText: string;
  blockquoteBg: string;
  blockquoteText: string;
  tableBorderColor: string;
  tableHeaderBg: string;
  showPageOutline: boolean;
}

interface PageStylesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  styles: PageStyles;
  onStyleChange: (styles: Partial<PageStyles>) => void;
  onInsertTable?: (rows: number, cols: number) => void;
}

const TABLE_OPTIONS = [
  { label: '2 x 2', rows: 2, cols: 2 },
  { label: '2 x 3', rows: 2, cols: 3 },
  { label: '3 x 2', rows: 3, cols: 2 },
  { label: '3 x 3', rows: 3, cols: 3 },
  { label: '3 x 4', rows: 3, cols: 4 },
  { label: '4 x 3', rows: 4, cols: 3 },
  { label: '4 x 4', rows: 4, cols: 4 },
  { label: '3 x 5', rows: 3, cols: 5 },
  { label: '5 x 3', rows: 5, cols: 3 },
  { label: '5 x 5', rows: 5, cols: 5 },
];

export function PageStylesPanel({ isOpen, onToggle, styles, onStyleChange, onInsertTable }: PageStylesPanelProps) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0 z-50" : "translate-x-full pointer-events-none z-20"
      )}
      data-testid="page-styles-panel"
    >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between relative bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Page Styles</h3>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            data-testid="button-close-page-styles"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Font Style */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStyleChange({ fontStyle: 'system' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'system'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-system"
              >
                <span className="text-xl mb-1">Aa</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">System</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontStyle: 'serif' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'serif'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-serif"
              >
                <span className="text-xl mb-1 font-serif">Ss</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Serif</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontStyle: 'mono' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'mono'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-mono"
              >
                <span className="text-xl mb-1 font-mono">00</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Mono</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontStyle: 'inter' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'inter'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-inter"
              >
                <span className="text-xl mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Aa</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Inter</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontStyle: 'roboto' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'roboto'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-roboto"
              >
                <span className="text-xl mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Aa</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Roboto</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontStyle: 'playfair' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontStyle === 'playfair'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-style-playfair"
              >
                <span className="text-xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Aa</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Playfair</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Font size
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onStyleChange({ fontSize: 'small' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontSize === 'small'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-size-small"
              >
                <span className="text-sm mb-1">Aa ≡</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Small</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontSize: 'default' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontSize === 'default'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-size-default"
              >
                <span className="text-base mb-1">Aa ≡</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Default</span>
              </button>
              <button
                onClick={() => onStyleChange({ fontSize: 'large' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.fontSize === 'large'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="font-size-large"
              >
                <span className="text-lg mb-1">Aa ≡</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Large</span>
              </button>
            </div>
          </div>

          {/* Page Width */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Page width
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStyleChange({ pageWidth: 'default' })}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
                  styles.pageWidth === 'default'
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
                  styles.pageWidth === 'full'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                data-testid="page-width-full"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">Full width</span>
              </button>
            </div>
          </div>

          {/* Color Styling Table */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Color Styles
            </label>
            <div className="space-y-4">
              {/* Basic Colors */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Basic</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Background</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.backgroundColor}
                          onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Text</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.textColor}
                          onChange={(e) => onStyleChange({ textColor: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Links</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.linkColor}
                          onChange={(e) => onStyleChange({ linkColor: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Headings */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Headings</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H1 (Title)</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h1Color}
                          onChange={(e) => onStyleChange({ h1Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H2</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h2Color}
                          onChange={(e) => onStyleChange({ h2Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H3</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h3Color}
                          onChange={(e) => onStyleChange({ h3Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H4</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h4Color}
                          onChange={(e) => onStyleChange({ h4Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H5</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h5Color}
                          onChange={(e) => onStyleChange({ h5Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">H6</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.h6Color}
                          onChange={(e) => onStyleChange({ h6Color: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Advanced Elements */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Elements</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Code Block BG</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.codeBlockBg}
                          onChange={(e) => onStyleChange({ codeBlockBg: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Code Block Text</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.codeBlockText}
                          onChange={(e) => onStyleChange({ codeBlockText: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Quote BG</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.blockquoteBg}
                          onChange={(e) => onStyleChange({ blockquoteBg: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Quote Text</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.blockquoteText}
                          onChange={(e) => onStyleChange({ blockquoteText: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Table Border</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.tableBorderColor}
                          onChange={(e) => onStyleChange({ tableBorderColor: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">Table Header BG</td>
                      <td className="px-3 py-2">
                        <input
                          type="color"
                          value={styles.tableHeaderBg}
                          onChange={(e) => onStyleChange({ tableHeaderBg: e.target.value })}
                          className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Popular Color Presets */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Color Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onStyleChange({
                  backgroundColor: '#ffffff',
                  textColor: '#1f2937',
                  headingColor: '#111827',
                  h1Color: '#111827',
                  h2Color: '#1f2937',
                  h3Color: '#374151',
                  h4Color: '#4b5563',
                  h5Color: '#6b7280',
                  h6Color: '#9ca3af',
                  linkColor: '#3b82f6',
                  codeBlockBg: '#f3f4f6',
                  codeBlockText: '#1f2937',
                  blockquoteBg: '#f9fafb',
                  blockquoteText: '#4b5563',
                  tableBorderColor: '#e5e7eb',
                  tableHeaderBg: '#f3f4f6'
                })}
                className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
                  <div className="w-4 h-4 rounded bg-gray-800"></div>
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Default</span>
              </button>
              <button
                onClick={() => onStyleChange({
                  backgroundColor: '#1e293b',
                  textColor: '#e2e8f0',
                  headingColor: '#f1f5f9',
                  h1Color: '#f1f5f9',
                  h2Color: '#e2e8f0',
                  h3Color: '#cbd5e1',
                  h4Color: '#94a3b8',
                  h5Color: '#64748b',
                  h6Color: '#475569',
                  linkColor: '#60a5fa',
                  codeBlockBg: '#0f172a',
                  codeBlockText: '#e2e8f0',
                  blockquoteBg: '#334155',
                  blockquoteText: '#cbd5e1',
                  tableBorderColor: '#475569',
                  tableHeaderBg: '#334155'
                })}
                className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded bg-slate-800"></div>
                  <div className="w-4 h-4 rounded bg-slate-200"></div>
                  <div className="w-4 h-4 rounded bg-blue-400"></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Dark</span>
              </button>
              <button
                onClick={() => onStyleChange({
                  backgroundColor: '#fef3c7',
                  textColor: '#78350f',
                  headingColor: '#451a03',
                  h1Color: '#451a03',
                  h2Color: '#78350f',
                  h3Color: '#92400e',
                  h4Color: '#b45309',
                  h5Color: '#d97706',
                  h6Color: '#f59e0b',
                  linkColor: '#ea580c',
                  codeBlockBg: '#fef9c3',
                  codeBlockText: '#78350f',
                  blockquoteBg: '#fef9c3',
                  blockquoteText: '#92400e',
                  tableBorderColor: '#fde68a',
                  tableHeaderBg: '#fef9c3'
                })}
                className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded bg-amber-100"></div>
                  <div className="w-4 h-4 rounded bg-amber-900"></div>
                  <div className="w-4 h-4 rounded bg-orange-600"></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Warm</span>
              </button>
              <button
                onClick={() => onStyleChange({
                  backgroundColor: '#ecfdf5',
                  textColor: '#064e3b',
                  headingColor: '#022c22',
                  h1Color: '#022c22',
                  h2Color: '#064e3b',
                  h3Color: '#065f46',
                  h4Color: '#047857',
                  h5Color: '#059669',
                  h6Color: '#10b981',
                  linkColor: '#10b981',
                  codeBlockBg: '#d1fae5',
                  codeBlockText: '#064e3b',
                  blockquoteBg: '#d1fae5',
                  blockquoteText: '#065f46',
                  tableBorderColor: '#a7f3d0',
                  tableHeaderBg: '#d1fae5'
                })}
                className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded bg-emerald-50"></div>
                  <div className="w-4 h-4 rounded bg-emerald-900"></div>
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Nature</span>
              </button>
            </div>
          </div>

          {/* Insert Table */}
          {onInsertTable && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                Insert Table
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TABLE_OPTIONS.map((table) => (
                  <button
                    key={table.label}
                    onClick={() => onInsertTable(table.rows, table.cols)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <Table className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{table.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
