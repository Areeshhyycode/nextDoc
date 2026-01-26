import React from "react";

interface TemplateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function TemplateCard({ icon, title, description, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-2.5 p-3.5 sm:px-3 sm:py-2.5 bg-white dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md active:scale-[0.98] transition-all text-left w-full group touch-manipulation"
    >
      <div className="flex-shrink-0 group-hover:scale-105 transition-transform">{icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-sm mb-1 leading-tight">{title}</h3>
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug font-medium">{description}</p>
      </div>
    </button>
  );
}
