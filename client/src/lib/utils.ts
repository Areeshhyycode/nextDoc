import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts underscore or snake_case strings to Title Case with spaces
 * Example: "in_progress" -> "In Progress", "not_started" -> "Not Started"
 */
export function formatDisplayValue(value: string): string {
  if (!value) return '';
  return value.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
