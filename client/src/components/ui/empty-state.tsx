interface EmptyStateProps {
  message: string;
  "data-testid"?: string;
}

export function EmptyState({ message, "data-testid": testId }: EmptyStateProps) {
  return (
    <div className="text-center py-12" data-testid={testId}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
