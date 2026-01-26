import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  "data-testid"?: string;
}

/**
 * Reusable stats card with icon, value and description
 */
export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  valueColor = "text-blue-600",
  "data-testid": testId,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2" data-testid={testId}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
