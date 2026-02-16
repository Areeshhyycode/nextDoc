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
      className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 rounded-xl hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 active:scale-[0.98] transition-all text-left w-full group focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
      <div
        className="flex-shrink-0 group-hover:scale-105 transition-transform"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}
