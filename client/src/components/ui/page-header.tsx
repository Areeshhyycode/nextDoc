interface PageHeaderProps {
  title: string;
  description?: string;
  titleTestId?: string;
  descriptionTestId?: string;
}

export function PageHeader({ title, description, titleTestId, descriptionTestId }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground" data-testid={titleTestId}>
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground" data-testid={descriptionTestId}>
          {description}
        </p>
      )}
    </div>
  );
}
