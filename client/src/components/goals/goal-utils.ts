interface GoalProgress {
  progressPercentage: number;
}

export function getProgressColor(isOverdue: boolean, percentage: number): string {
  if (isOverdue && percentage < 100) return "bg-red-500";
  if (percentage === 100) return "bg-green-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-gray-400";
}

export function getProgressBadgeColor(percentage: number, isOverdue: boolean): string {
  if (isOverdue && percentage < 100) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  if (percentage === 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (percentage >= 70) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (percentage >= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

export function getGoalStatusLabel(percentage: number, isOverdue: boolean): string {
  if (isOverdue) return 'Overdue';
  if (percentage === 100) return 'Completed';
  if (percentage > 0) return 'In Progress';
  return 'Not Started';
}

export function checkIsOverdue(
  targetDate: string | Date | null | undefined,
  progress: GoalProgress | undefined
): boolean {
  return !!(
    targetDate &&
    new Date(targetDate) < new Date() &&
    (progress?.progressPercentage ?? 0) < 100
  );
}

export function checkIsOverdueSimple(
  targetDate: string | Date | null | undefined,
  progressPercentage: number
): boolean {
  return !!(
    targetDate &&
    new Date(targetDate) < new Date() &&
    progressPercentage < 100
  );
}
