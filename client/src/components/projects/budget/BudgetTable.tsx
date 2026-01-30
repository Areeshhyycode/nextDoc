import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "./types";
import type { ProjectBudget, ProjectCost } from "./types";

interface BudgetTableProps {
  budgets: ProjectBudget[];
  costs: ProjectCost[];
  totalBudget: number;
  totalCosts: number;
  onEditCost: (cost: ProjectCost) => void;
  onDeleteCost: (costId: string) => void;
}

export function BudgetTable({
  budgets,
  costs,
  totalBudget,
  totalCosts,
  onEditCost,
  onDeleteCost,
}: BudgetTableProps) {
  const [costsExpanded, setCostsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
        <div>Name</div>
        <div className="flex items-center gap-1">Category</div>
        <div className="flex items-center gap-1">Date</div>
        <div className="text-right">Total Amount</div>
      </div>

      {/* Budget Items */}
      {budgets.map((budget) => (
        <div
          key={budget.id}
          className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors"
          data-testid={`budget-row-${budget.id}`}
        >
          <div className="font-medium text-foreground">{budget.name}</div>
          <div className="text-muted-foreground">{budget.category || ""}</div>
          <div className="text-muted-foreground">{formatDate(budget.billDate)}</div>
          <div className="text-right font-medium text-foreground">{formatCurrency(budget.amount)}</div>
        </div>
      ))}

      {budgets.length > 0 && (
        <div
          className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 bg-muted/30 rounded-lg font-semibold"
          data-testid="total-budget-row"
        >
          <div className="text-foreground">Total budget</div>
          <div></div>
          <div></div>
          <div className="text-right text-foreground">{formatCurrency(totalBudget)}</div>
        </div>
      )}

      {/* Total Time Billed */}
      <div
        className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors"
        data-testid="time-billed-row"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="font-medium text-foreground">Total time billed</span>
        </div>
        <div></div>
        <div></div>
        <div className="text-right font-medium text-foreground">$0.00</div>
      </div>

      {/* Costs Section - Collapsible */}
      <div className="space-y-2">
        <div
          className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          onClick={() => setCostsExpanded(!costsExpanded)}
          data-testid="costs-header"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {costsExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">Costs</span>
          </div>
          <div></div>
          <div></div>
          <div className="text-right font-medium text-foreground">{formatCurrency(totalCosts)}</div>
        </div>

        {/* Individual Costs - Indented */}
        {costsExpanded && costs.map((cost) => (
          <div
            key={cost.id}
            className="group relative grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 pl-12 hover:bg-muted/50 rounded-lg transition-colors"
            data-testid={`cost-row-${cost.id}`}
          >
            <div className="text-foreground flex items-center gap-2">
              <span>{cost.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                  onClick={() => onEditCost(cost)}
                  data-testid={`button-edit-cost-${cost.id}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  onClick={() => onDeleteCost(cost.id)}
                  data-testid={`button-delete-cost-${cost.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="text-muted-foreground">{cost.category || "-"}</div>
            <div className="text-muted-foreground">{formatDate(cost.date) || "-"}</div>
            <div className="text-right font-medium text-foreground">
              {formatCurrency(cost.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
