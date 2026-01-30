import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BudgetFormValues, CostFormValues } from "./types";

interface MutationOptions {
  projectId: string;
  onBudgetDialogClose: () => void;
  onCostDialogClose: () => void;
  onCostEditComplete: () => void;
  resetBudgetForm: () => void;
  resetCostForm: () => void;
}

export function useBudgetMutations({
  projectId,
  onBudgetDialogClose,
  onCostDialogClose,
  onCostEditComplete,
  resetBudgetForm,
  resetCostForm,
}: MutationOptions) {
  const { toast } = useToast();

  const addBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/budgets`, {
        ...data,
        projectId,
        amount: Math.round(parseFloat(data.amount) * 100),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "budgets"] });
      onBudgetDialogClose();
      resetBudgetForm();
      toast({ title: "Budget added", description: "Budget has been added successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add budget",
        variant: "destructive",
      });
    },
  });

  const addCostMutation = useMutation({
    mutationFn: async (data: CostFormValues) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/costs`, {
        ...data,
        projectId,
        amount: Math.round(parseFloat(data.amount) * 100),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      onCostDialogClose();
      resetCostForm();
      toast({ title: "Cost added", description: "Cost has been added successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add cost",
        variant: "destructive",
      });
    },
  });

  const updateCostMutation = useMutation({
    mutationFn: async (data: CostFormValues & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/project-costs/${data.id}`, {
        ...data,
        amount: Math.round(parseFloat(data.amount) * 100),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      onCostDialogClose();
      onCostEditComplete();
      resetCostForm();
      toast({ title: "Cost updated", description: "Cost has been updated successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cost",
        variant: "destructive",
      });
    },
  });

  const deleteCostMutation = useMutation({
    mutationFn: async (costId: string) => {
      await apiRequest("DELETE", `/api/project-costs/${costId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      toast({ title: "Cost deleted", description: "Cost has been deleted successfully." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete cost",
        variant: "destructive",
      });
    },
  });

  return { addBudgetMutation, addCostMutation, updateCostMutation, deleteCostMutation };
}
