import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ColumnWidth {
  [key: string]: number;
}

interface ResizableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  columnKey: string;
  minWidth?: number;
  defaultWidth?: number;
  storageKey: string;
  onWidthChange?: (columnKey: string, width: number) => void;
  children: React.ReactNode;
}

export const ResizableTableHead = React.forwardRef<HTMLTableCellElement, ResizableTableHeadProps>(
  ({ columnKey, minWidth = 80, defaultWidth = 150, storageKey, onWidthChange, className, children, ...props }, ref) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState<number>(defaultWidth);
    const thRef = useRef<HTMLTableCellElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    // Load width from localStorage on mount
    useEffect(() => {
      const savedWidths = localStorage.getItem(storageKey);
      if (savedWidths) {
        try {
          const widths: ColumnWidth = JSON.parse(savedWidths);
          if (widths[columnKey]) {
            setWidth(widths[columnKey]);
          }
        } catch (e) {
          console.error('Failed to parse column widths:', e);
        }
      }
    }, [columnKey, storageKey]);

    // Save width to localStorage
    const saveWidth = useCallback((newWidth: number) => {
      const savedWidths = localStorage.getItem(storageKey);
      let widths: ColumnWidth = {};
      
      if (savedWidths) {
        try {
          widths = JSON.parse(savedWidths);
        } catch (e) {
          console.error('Failed to parse column widths:', e);
        }
      }
      
      widths[columnKey] = newWidth;
      localStorage.setItem(storageKey, JSON.stringify(widths));
      
      if (onWidthChange) {
        onWidthChange(columnKey, newWidth);
      }
    }, [columnKey, storageKey, onWidthChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const diff = e.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, startWidthRef.current + diff);
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        if (isResizing) {
          setIsResizing(false);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          saveWidth(width);
        }
      };

      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isResizing, minWidth, width, saveWidth]);

    return (
      <th
        ref={thRef}
        className={cn(
          'relative h-12 px-4 text-left align-middle font-medium text-muted-foreground',
          className
        )}
        style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
        {...props}
      >
        {children}
        
        {/* Resize Handle */}
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors',
            'after:absolute after:right-[-2px] after:top-0 after:h-full after:w-[5px] after:content-[""]',
            isResizing && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
          data-testid={`resize-handle-${columnKey}`}
        />
      </th>
    );
  }
);

ResizableTableHead.displayName = 'ResizableTableHead';

// Hook to get column widths for applying to cells
export function useColumnWidths(storageKey: string, defaultWidths: ColumnWidth) {
  const [widths, setWidths] = useState<ColumnWidth>(defaultWidths);

  useEffect(() => {
    const savedWidths = localStorage.getItem(storageKey);
    if (savedWidths) {
      try {
        const parsed: ColumnWidth = JSON.parse(savedWidths);
        setWidths({ ...defaultWidths, ...parsed });
      } catch (e) {
        console.error('Failed to parse column widths:', e);
      }
    }
  }, [storageKey]);

  const updateWidth = useCallback((columnKey: string, width: number) => {
    setWidths(prev => ({ ...prev, [columnKey]: width }));
  }, []);

  return { widths, updateWidth };
}
