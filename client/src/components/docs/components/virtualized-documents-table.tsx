/**
 * Virtualized Documents Table
 *
 * High-performance virtualized table for displaying 1000+ documents.
 * Uses @tanstack/react-virtual for efficient rendering of large lists.
 */

import { useRef, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus } from "lucide-react";
import type { DocumentWithOwner } from "@shared/schema";
import { MobileDocumentRow } from "./virtualized-docs/MobileDocumentRow";
import { DesktopDocumentRow } from "./virtualized-docs/DesktopDocumentRow";

interface VirtualizedDocumentsTableProps {
  documents: DocumentWithOwner[];
}

const ROW_HEIGHT_MOBILE = 85;
const ROW_HEIGHT_DESKTOP = 52;

export function VirtualizedDocumentsTable({ documents }: VirtualizedDocumentsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Handle resize to update mobile state
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Set up resize listener
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  const rowHeight = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP;

  const virtualizer = useVirtualizer({
    count: documents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-xl border-2 border-gray-200/60 dark:border-gray-700/50 overflow-hidden shadow-lg shadow-gray-100/50 dark:shadow-gray-900/50">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_50px_40px] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px_40px] gap-3 px-4 lg:px-6 py-3 bg-gradient-to-b from-gray-50 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-800/40 border-b-2 border-gray-200/60 dark:border-gray-700/50">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Name</div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Created By</div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">Create date</div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">Update date</div>
        <div className="hidden lg:block text-xs font-medium text-gray-500 dark:text-gray-400">Date viewed</div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Sharing</div>
        <div className="flex justify-end">
          <button
            className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            aria-label="Add column"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '400px' }}
        role="list"
        aria-label="Documents list"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const doc = documents[virtualItem.index];
            const style: React.CSSProperties = {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            };

            return isMobile ? (
              <MobileDocumentRow key={doc.id} doc={doc} style={style} />
            ) : (
              <DesktopDocumentRow key={doc.id} doc={doc} style={style} />
            );
          })}
        </div>
      </div>

      {/* Performance indicator for large lists */}
      {documents.length > 100 && (
        <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/30">
          Showing {documents.length} documents (virtualized for performance)
        </div>
      )}
    </div>
  );
}
