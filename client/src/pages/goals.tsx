import { useState } from "react";
import { type Goal } from "@shared/schema";
import { GoalModal } from "@/components/goals/goal-modal";
import {
  GoalsPageHeader,
  GoalsSummaryCards,
  GoalsSearchBar,
  GoalsTable
} from "@/components/goals";
import { useGoals, useGoalMutations, useGoalFiltering } from "@/hooks/use-goals";
import { useLocation } from "wouter";

export function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Custom hooks for data fetching and mutations
  const { goalsWithProgress, isLoading } = useGoals();
  const { createGoal, updateGoal, deleteGoal } = useGoalMutations();
  const filteredGoals = useGoalFiltering(goalsWithProgress, searchQuery);

  // Handlers
  const handleCreateGoal = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoal.mutate(id);
    }
  };

  const handleCreateSubmit = (data: any) => {
    createGoal.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false)
    });
  };

  const handleUpdateSubmit = (data: any) => {
    updateGoal.mutate(
      { id: editingGoal?.id, ...data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingGoal(null);
        }
      }
    );
  };

  const handleRowClick = (goalId: string) => {
    setLocation(`/goals/${goalId}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <GoalsPageHeader onCreateGoal={handleCreateGoal} />

      {/* Summary Cards */}
      <GoalsSummaryCards goals={goalsWithProgress} />

      {/* Search Bar */}
      <GoalsSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Goals Table */}
      <GoalsTable
        goals={filteredGoals}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      <GoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createGoal.isPending}
      />

      {/* Edit Modal */}
      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSubmit={handleUpdateSubmit}
        isLoading={updateGoal.isPending}
      />
    </div>
  );
}
