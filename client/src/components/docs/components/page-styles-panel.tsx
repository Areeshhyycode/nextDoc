import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface PageStyles {
  fontStyle: 'system' | 'serif' | 'mono';
  fontSize: 'small' | 'default' | 'large';
  pageWidth: 'default' | 'full';
  showCoverImage: boolean;
  showPageIconAndTitle: boolean;
  showAuthor: boolean;
  showContributors: boolean;
  showSubtitle: boolean;
  showLastModified: boolean;
  showPageOutline: boolean;
}

interface PageStylesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  styles: PageStyles;
  onStyleChange: (styles: Partial<PageStyles>) => void;
}

export function PageStylesPanel({ isOpen, onToggle, styles, onStyleChange }: PageStylesPanelProps) {
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
              Font style
            </label>
            <div className="grid grid-cols-3 gap-2">
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

          {/* Header Options */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Header
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>🖼️</span>
                  Cover image
                </label>
                <Switch
                  checked={styles.showCoverImage}
                  onCheckedChange={(checked) => onStyleChange({ showCoverImage: checked })}
                  data-testid="toggle-cover-image"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>😊</span>
                  Page icon & title
                </label>
                <Switch
                  checked={styles.showPageIconAndTitle}
                  onCheckedChange={(checked) => onStyleChange({ showPageIconAndTitle: checked })}
                  data-testid="toggle-page-icon-title"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>👤</span>
                  Author
                </label>
                <Switch
                  checked={styles.showAuthor}
                  onCheckedChange={(checked) => onStyleChange({ showAuthor: checked })}
                  data-testid="toggle-author"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>👥</span>
                  Contributors
                </label>
                <Switch
                  checked={styles.showContributors}
                  onCheckedChange={(checked) => onStyleChange({ showContributors: checked })}
                  data-testid="toggle-contributors"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>T</span>
                  Subtitle
                </label>
                <Switch
                  checked={styles.showSubtitle}
                  onCheckedChange={(checked) => onStyleChange({ showSubtitle: checked })}
                  data-testid="toggle-subtitle"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>🕐</span>
                  Last modified
                </label>
                <Switch
                  checked={styles.showLastModified}
                  onCheckedChange={(checked) => onStyleChange({ showLastModified: checked })}
                  data-testid="toggle-last-modified"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
              Sections
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>📄</span>
                  Page outline
                </label>
                <Switch
                  checked={styles.showPageOutline}
                  onCheckedChange={(checked) => onStyleChange({ showPageOutline: checked })}
                  data-testid="toggle-page-outline"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
