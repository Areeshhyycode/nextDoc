interface DocsFooterStatsProps {
  count: number;
}

export function DocsFooterStats({ count }: DocsFooterStatsProps) {
  return (
    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
      <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
        Showing <span className="font-extrabold text-gray-700 dark:text-gray-300">{count}</span> document{count !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2 text-[11px] sm:text-sm text-gray-400 dark:text-gray-500 font-medium">
        <span>Last synced just now</span>
      </div>
    </div>
  );
}
