import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProjectBudget, ProjectCost } from "@shared/schema";

import {
  budgetFormSchema,
  costFormSchema,
  type BudgetFormValues,
  type CostFormValues,
  type BudgetOverviewProps,
} from "./budget/types";
import { useBudgetMutations } from "./budget/use-budget-mutations";
import { BudgetFormDialog } from "./budget/BudgetFormDialog";
import { CostFormDialog } from "./budget/CostFormDialog";
import { BudgetSummary } from "./budget/BudgetSummary";
import { BudgetTable } from "./budget/BudgetTable";

export function BudgetOverview({ projectId }: BudgetOverviewProps) {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<ProjectCost | null>(null);

  // Fetch budgets & costs
  const { data: budgets = [] } = useQuery<ProjectBudget[]>({
    queryKey: ["/api/projects", projectId, "budgets"],
  });
  const { data: costs = [] } = useQuery<ProjectCost[]>({
    queryKey: ["/api/projects", projectId, "costs"],
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  // Forms
  const budgetForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { name: "", type: "fixed", amount: "", currency: "USD", billDate: "", category: "", description: "" },
  });

  const costForm = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: { name: "", type: "fixed", amount: "", currency: "USD", date: "", category: "", description: "" },
  });

  // Mutations
  const { addBudgetMutation, addCostMutation, updateCostMutation, deleteCostMutation } =
    useBudgetMutations({
      projectId,
      onBudgetDialogClose: () => setBudgetDialogOpen(false),
      onCostDialogClose: () => setCostDialogOpen(false),
      onCostEditComplete: () => setEditingCost(null),
      resetBudgetForm: () => budgetForm.reset(),
      resetCostForm: () => costForm.reset(),
    });

  // Cost handlers
  const handleEditCost = (cost: ProjectCost) => {
    setEditingCost(cost);
    costForm.reset({
      name: cost.name,
      type: cost.type as "fixed" | "hourly",
      amount: (cost.amount / 100).toString(),
      currency: cost.currency || "USD",
      date: cost.date || "",
      category: cost.category || "",
      description: cost.description || "",
    });
    setCostDialogOpen(true);
  };

  const handleDeleteCost = (costId: string) => {
    if (confirm("Are you sure you want to delete this cost?")) {
      deleteCostMutation.mutate(costId);
    }
  };

  const handleCostDialogClose = (open: boolean) => {
    setCostDialogOpen(open);
    if (!open) {
      setEditingCost(null);
      costForm.reset();
    }
  };

  const handleCostSubmit = (data: CostFormValues) => {
    if (editingCost) {
      updateCostMutation.mutate({ ...data, id: editingCost.id });
    } else {
      addCostMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with dialogs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Budget Overview</h3>
        <div className="flex items-center gap-2">
          <CostFormDialog
            open={costDialogOpen}
            onOpenChange={handleCostDialogClose}
            form={costForm}
            onSubmit={handleCostSubmit}
            editingCost={editingCost}
            isAddPending={addCostMutation.isPending}
            isUpdatePending={updateCostMutation.isPending}
          />
          <BudgetFormDialog
            open={budgetDialogOpen}
            onOpenChange={setBudgetDialogOpen}
            form={budgetForm}
            onSubmit={(data) => addBudgetMutation.mutate(data)}
            isPending={addBudgetMutation.isPending}
          />
        </div>
      </div>

      <BudgetSummary totalBudget={totalBudget} totalCosts={totalCosts} />

      <BudgetTable
        budgets={budgets}
        costs={costs}
        totalBudget={totalBudget}
        totalCosts={totalCosts}
        onEditCost={handleEditCost}
        onDeleteCost={handleDeleteCost}
      />

      {budgets.length === 0 && costs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No budget or costs added yet</p>
          <p className="text-sm mt-1">Click "Add budget" or "Add costs" to get started</p>
        </div>
      )}
    </div>
  );
}
