import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ChevronDown, ChevronRight, CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProjectBudget, ProjectCost } from "@shared/schema";
import { format } from "date-fns";

interface BudgetOverviewProps {
  projectId: string;
}

const budgetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["fixed", "hourly"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  billDate: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const costFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["fixed", "hourly"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  date: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;
type CostFormValues = z.infer<typeof costFormSchema>;

export function BudgetOverview({ projectId }: BudgetOverviewProps) {
  const { toast } = useToast();
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costsExpanded, setCostsExpanded] = useState(true);
  const [editingCost, setEditingCost] = useState<ProjectCost | null>(null);

  // Fetch budgets
  const { data: budgets = [] } = useQuery<ProjectBudget[]>({
    queryKey: ["/api/projects", projectId, "budgets"],
  });

  // Fetch costs
  const { data: costs = [] } = useQuery<ProjectCost[]>({
    queryKey: ["/api/projects", projectId, "costs"],
  });

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const usedPercentage = totalBudget > 0 ? Math.round((totalCosts / totalBudget) * 100) : 0;
  const remainingPercentage = 100 - usedPercentage;
  const remaining = totalBudget - totalCosts;

  // Budget form
  const budgetForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      type: "fixed",
      amount: "",
      currency: "USD",
      billDate: "",
      category: "",
      description: "",
    },
  });

  // Cost form
  const costForm = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      name: "",
      type: "fixed",
      amount: "",
      currency: "USD",
      date: "",
      category: "",
      description: "",
    },
  });

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/budgets`, {
        ...data,
        projectId,
        amount: Math.round(parseFloat(data.amount) * 100), // Convert to cents
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "budgets"] });
      setBudgetDialogOpen(false);
      budgetForm.reset();
      toast({
        title: "Budget added",
        description: "Budget has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add budget",
        variant: "destructive",
      });
    },
  });

  // Add cost mutation
  const addCostMutation = useMutation({
    mutationFn: async (data: CostFormValues) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/costs`, {
        ...data,
        projectId,
        amount: Math.round(parseFloat(data.amount) * 100), // Convert to cents
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      setCostDialogOpen(false);
      costForm.reset();
      toast({
        title: "Cost added",
        description: "Cost has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add cost",
        variant: "destructive",
      });
    },
  });

  // Update cost mutation
  const updateCostMutation = useMutation({
    mutationFn: async (data: CostFormValues & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/project-costs/${data.id}`, {
        ...data,
        amount: Math.round(parseFloat(data.amount) * 100), // Convert to cents
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      setCostDialogOpen(false);
      setEditingCost(null);
      costForm.reset();
      toast({
        title: "Cost updated",
        description: "Cost has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cost",
        variant: "destructive",
      });
    },
  });

  // Delete cost mutation
  const deleteCostMutation = useMutation({
    mutationFn: async (costId: string) => {
      await apiRequest("DELETE", `/api/project-costs/${costId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "costs"] });
      toast({
        title: "Cost deleted",
        description: "Cost has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete cost",
        variant: "destructive",
      });
    },
  });

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

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Budget Overview</h3>
        <div className="flex items-center gap-2">
          <Dialog open={costDialogOpen} onOpenChange={handleCostDialogClose}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-costs">
                <Plus className="h-4 w-4 mr-1" />
                Add costs
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCost ? "Edit Cost" : "Add Cost"}</DialogTitle>
              </DialogHeader>
              <Form {...costForm}>
                <form onSubmit={costForm.handleSubmit((data) => {
                  if (editingCost) {
                    updateCostMutation.mutate({ ...data, id: editingCost.id });
                  } else {
                    addCostMutation.mutate(data);
                  }
                })} className="space-y-4">
                  <FormField
                    control={costForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cost name" data-testid="input-cost-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={costForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-cost-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={costForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cost-currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="CNY">CNY (¥)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={costForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="input-cost-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={costForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., R&D, Marketing" data-testid="input-cost-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => handleCostDialogClose(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addCostMutation.isPending || updateCostMutation.isPending} data-testid="button-submit-cost">
                      {editingCost ? (updateCostMutation.isPending ? "Updating..." : "Update Cost") : (addCostMutation.isPending ? "Adding..." : "Add Cost")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-budget">
                <Plus className="h-4 w-4 mr-1" />
                Add budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget</DialogTitle>
              </DialogHeader>
              <Form {...budgetForm}>
                <form onSubmit={budgetForm.handleSubmit((data) => addBudgetMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={budgetForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Budget name" data-testid="input-budget-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={budgetForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-budget-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={budgetForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-budget-currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="CNY">CNY (¥)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={budgetForm.control}
                    name="billDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Bill Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="input-budget-bill-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={budgetForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., R&D, Marketing" data-testid="input-budget-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addBudgetMutation.isPending} data-testid="button-submit-budget">
                      {addBudgetMutation.isPending ? "Adding..." : "Add Budget"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Summary - Large Fonts */}
      <div className="space-y-4 border-b pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Used</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-semibold ${usedPercentage > 100 ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`} data-testid="text-used-amount">
                {formatCurrency(totalCosts)}
              </span>
              <span className={`text-2xl ${usedPercentage > 100 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`} data-testid="text-used-percentage">
                ({usedPercentage}%)
              </span>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <p className="text-sm text-muted-foreground">Total Budget (Remaining)</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-semibold ${remaining < 0 ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`} data-testid="text-remaining-amount">
                {formatCurrency(remaining)}
              </span>
              <span className={`text-2xl ${remaining < 0 ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`} data-testid="text-remaining-percentage">
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

      {/* Budget Table */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
          <div>Name</div>
          <div className="flex items-center gap-1">
            Category
          </div>
          <div className="flex items-center gap-1">
            Date
          </div>
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

        {/* Total Time Billed - Currently $0.00 */}
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
                {/* Edit/Delete buttons - next to cost name */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    onClick={() => handleEditCost(cost)}
                    data-testid={`button-edit-cost-${cost.id}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    onClick={() => handleDeleteCost(cost.id)}
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

      {budgets.length === 0 && costs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No budget or costs added yet</p>
          <p className="text-sm mt-1">Click "Add budget" or "Add costs" to get started</p>
        </div>
      )}
    </div>
  );
}
