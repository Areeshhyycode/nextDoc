interface ImportModalHeaderProps {
  step?: number;
  totalSteps?: number;
  title: string;
}

export function ImportModalHeader({ step = 2, totalSteps = 3, title }: ImportModalHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-4 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        STEP {step} OF {totalSteps}
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
}
