/**
 * Skeleton Loading States for Documents
 *
 * Provides shimmer-effect loading placeholders that match
 * the actual document table layout for a seamless loading experience.
 */

import { memo } from "react";

// Skeleton row for mobile view
const MobileSkeletonRow = memo(function MobileSkeletonRow({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col gap-0 px-4 py-4 border-b last:border-b-0 border-gray-100 dark:border-gray-700/30 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          {/* Meta info */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
});

// Skeleton row for desktop view
const DesktopSkeletonRow = memo(function DesktopSkeletonRow({ index }: { index: number }) {
  return (
    <div
      className="grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3.5 border-b last:border-b-0 border-gray-100/50 dark:border-gray-700/20 animate-pulse"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      </div>

      {/* Created By */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>

      {/* Create date */}
      <div className="hidden lg:block">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>

      {/* Update date */}
      <div className="hidden lg:block">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>

      {/* Date viewed */}
      <div className="hidden lg:block">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>

      {/* Sharing */}
      <div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
});

interface DocumentsSkeletonProps {
  count?: number;
}

/**
 * Full table skeleton with header and rows
 */
export function DocumentsTableSkeleton({ count = 6 }: DocumentsSkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-xl border-2 border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-lg shadow-gray-100/50 dark:shadow-gray-900/50">
      {/* Table Header Skeleton - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3 bg-gradient-to-b from-gray-50 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-800/40 border-b-2 border-gray-200/60 dark:border-gray-700/50">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" style={{ animationDelay: '50ms' }} />
        <div className="hidden lg:block h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" style={{ animationDelay: '100ms' }} />
        <div className="hidden lg:block h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="hidden lg:block h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" style={{ animationDelay: '250ms' }} />
        <div className="flex justify-end">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Desktop Skeleton Rows */}
      <div className="hidden md:block">
        {Array.from({ length: count }).map((_, index) => (
          <DesktopSkeletonRow key={index} index={index} />
        ))}
      </div>

      {/* Mobile Skeleton Rows */}
      <div className="md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <MobileSkeletonRow key={index} index={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * Single row skeleton for inline loading
 */
export function DocumentRowSkeleton({ mobile = false }: { mobile?: boolean }) {
  return mobile ? <MobileSkeletonRow index={0} /> : <DesktopSkeletonRow index={0} />;
}

/**
 * Header skeleton for the docs toolbar
 */
export function DocsToolbarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-48" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
      </div>
    </div>
  );
}

/**
 * Templates section skeleton
 */
export function TemplatesSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 sm:h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"
            style={{ animationDelay: `${index * 75}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Full page skeleton for initial load
 */
export function DocsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
        </div>
      </div>

      {/* Templates skeleton */}
      <TemplatesSkeleton />

      {/* Toolbar skeleton */}
      <DocsToolbarSkeleton />

      {/* Table skeleton */}
      <DocumentsTableSkeleton count={8} />
    </div>
  );
}
