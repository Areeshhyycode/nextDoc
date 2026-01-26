import { Badge } from "@/components/ui/badge";
import {
  STATUS_COLORS,
  RISK_COLORS,
  STAGE_COLORS,
  getStatusConfig,
  getDepartmentColor
} from "@/constants/colors";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

interface RiskBadgeProps {
  risk: string;
  className?: string;
}

interface StageBadgeProps {
  stage: string;
  className?: string;
}

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

/**
 * Reusable status badge component
 * Automatically applies correct color based on status
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge
      variant={config.variant}
      className={cn("text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

/**
 * Simple status badge using just color mapping
 */
export function SimpleStatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS['Not Started'];
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs", colorClass, className)}
    >
      {status}
    </Badge>
  );
}

/**
 * Risk level badge component
 */
export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const colorClass = RISK_COLORS[risk] || RISK_COLORS['none'];
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs", colorClass, className)}
    >
      {risk || 'None'}
    </Badge>
  );
}

/**
 * Stage badge component
 */
export function StageBadge({ stage, className }: StageBadgeProps) {
  const colorClass = STAGE_COLORS[stage] || STAGE_COLORS['Others'];
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs", colorClass, className)}
    >
      {stage}
    </Badge>
  );
}

/**
 * Department badge component
 */
export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  const config = getDepartmentColor(department);
  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
