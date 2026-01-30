import { z } from "zod";
import { format } from "date-fns";
import type { ProjectBudget, ProjectCost } from "@shared/schema";

export interface BudgetOverviewProps {
  projectId: string;
}

export const budgetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["fixed", "hourly"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  billDate: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const costFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["fixed", "hourly"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  date: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CostFormValues = z.infer<typeof costFormSchema>;

export type { ProjectBudget, ProjectCost };

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}
