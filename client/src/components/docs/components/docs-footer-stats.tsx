interface DocsFooterStatsProps {
  count: number;
}

export function DocsFooterStats({ count }: DocsFooterStatsProps) {
  return (
    <div className="mt-5 flex items-center justify-between px-1">
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {count} document{count !== 1 ? 's' : ''}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Synced just now
      </p>
    </div>
  );
}
