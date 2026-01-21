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
      className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left flex-1 min-w-0"
    >
      <div className="flex-shrink-0 scale-90 sm:scale-100">{icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{title}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
    </button>
  );
}
