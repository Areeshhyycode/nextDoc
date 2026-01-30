import { formatCurrency } from "./types";

interface BudgetSummaryProps {
  totalBudget: number;
  totalCosts: number;
}

export function BudgetSummary({ totalBudget, totalCosts }: BudgetSummaryProps) {
  const usedPercentage = totalBudget > 0 ? Math.round((totalCosts / totalBudget) * 100) : 0;
  const remainingPercentage = 100 - usedPercentage;
  const remaining = totalBudget - totalCosts;

  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Used</p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-semibold ${usedPercentage > 100 ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`}
              data-testid="text-used-amount"
            >
              {formatCurrency(totalCosts)}
            </span>
            <span
              className={`text-2xl ${usedPercentage > 100 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}
              data-testid="text-used-percentage"
            >
              ({usedPercentage}%)
            </span>
          </div>
        </div>

        <div className="space-y-2 text-right">
          <p className="text-sm text-muted-foreground">Total Budget (Remaining)</p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-semibold ${remaining < 0 ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`}
              data-testid="text-remaining-amount"
            >
              {formatCurrency(remaining)}
            </span>
            <span
              className={`text-2xl ${remaining < 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}
              data-testid="text-remaining-percentage"
            >
              ({remainingPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Full-width progress bar with color coding */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            usedPercentage > 90 ? 'bg-red-500' :
            usedPercentage > 70 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(usedPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
