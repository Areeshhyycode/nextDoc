/**
 * Template Card Component
 *
 * Reusable card for displaying template options.
 * Fully accessible with keyboard navigation support.
 */

import React from "react";

interface TemplateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  ariaLabel?: string;
}

export function TemplateCard({
  icon,
  title,
  description,
  onClick,
  ariaLabel
}: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || `Use ${title} template`}
      className="flex flex-row items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-white dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700/50 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md active:scale-[0.98] transition-all text-left w-full group touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
      <div
        className="flex-shrink-0 group-hover:scale-105 transition-transform"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-[11px] sm:text-sm mb-0.5 sm:mb-1 leading-tight">
          {title}
        </h3>
        <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 leading-snug font-medium">
          {description}
        </p>
      </div>
    </button>
  );
}
