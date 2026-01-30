import { useState, useEffect } from 'react';

const STORAGE_KEY = 'docs_sidebar_collapsed';

/**
 * Hook to manage sidebar collapse state with localStorage persistence
 * @param defaultCollapsed - Default state when no preference is stored
 * @returns Tuple of [isCollapsed, setIsCollapsed, toggleCollapsed]
 */
export function useSidebarCollapse(defaultCollapsed = false) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultCollapsed;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  return [isCollapsed, setIsCollapsed, toggleCollapsed] as const;
}
