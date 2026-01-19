import { format } from "date-fns";

// Format relative time
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;

  return format(d, 'MMM d, yyyy');
}

// Check if document was updated after creation
export function wasUpdated(createdAt: Date | string | null, updatedAt: Date | string | null): boolean {
  if (!createdAt || !updatedAt) return false;
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  // Consider updated if more than 1 minute difference
  return (updated - created) > 60000;
}
