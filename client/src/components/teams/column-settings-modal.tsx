import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { KanbanColumn } from '@shared/schema';

interface ColumnSettingsModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  columns: KanbanColumn[];
}

const defaultColors = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F59E0B', // Orange
  '#10B981', // Green
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export function ColumnSettingsModal({ open, onClose, teamId, columns }: ColumnSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newColumnName, setNewColumnName] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

  const createColumnMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; order: number }) => {
      return await apiRequest(`/api/teams/${teamId}/kanban-columns`, 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId, 'kanban-columns'] });
      setNewColumnName('');
      toast({
        title: 'Column created',
        description: 'The new kanban column has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create column',
        variant: 'destructive',
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      return await apiRequest(`/api/kanban-columns/${columnId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId, 'kanban-columns'] });
      toast({
        title: 'Column deleted',
        description: 'The kanban column has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete column',
        variant: 'destructive',
      });
    },
  });

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please enter a column name',
        variant: 'destructive',
      });
      return;
    }

    const maxOrder = Math.max(...columns.map(c => c.order), -1);
    createColumnMutation.mutate({
      name: newColumnName.trim(),
      color: selectedColor,
      order: maxOrder + 1,
    });
  };

  const handleDeleteColumn = (column: KanbanColumn) => {
    if (column.isDefault) {
      toast({
        title: 'Cannot delete',
        description: 'Default columns cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Are you sure you want to delete the "${column.name}" column?`)) {
      deleteColumnMutation.mutate(column.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="column-settings-modal">
        <DialogHeader>
          <DialogTitle>Manage Kanban Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Columns */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Current Columns</Label>
            <div className="space-y-2">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`column-item-${column.id}`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="font-medium">{column.name}</span>
                    {column.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  {!column.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteColumn(column)}
                      disabled={deleteColumnMutation.isPending}
                      data-testid={`button-delete-column-${column.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Column */}
          <div className="border-t pt-6">
            <Label className="text-sm font-medium mb-3 block">Add New Column</Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="column-name">Column Name</Label>
                <Input
                  id="column-name"
                  placeholder="e.g., In Review, Testing, Done"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                  data-testid="input-column-name"
                />
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-black dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateColumn}
                disabled={createColumnMutation.isPending}
                className="w-full"
                data-testid="button-create-column"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createColumnMutation.isPending ? 'Creating...' : 'Add Column'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
