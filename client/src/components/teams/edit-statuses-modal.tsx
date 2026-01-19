import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GripVertical, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import type { KanbanColumn } from '@shared/schema';

interface EditStatusesModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: KanbanColumn[];
  onReorder: (columns: KanbanColumn[]) => void;
  onRename: (columnId: string, newName: string) => void;
  onDelete: (columnId: string) => void;
  onAdd: (name: string, icon: string, color: string) => void;
}

const DEFAULT_ICONS = [
  { emoji: '📋', name: 'clipboard' },
  { emoji: '📅', name: 'calendar' },
  { emoji: '🔨', name: 'hammer' },
  { emoji: '✅', name: 'checkmark' },
  { emoji: '⏸️', name: 'pause' },
  { emoji: '🎯', name: 'target' },
];

const DEFAULT_COLORS = [
  '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
];

const DND_ITEM_TYPE = 'COLUMN';

interface DraggableColumnItemProps {
  column: KanbanColumn;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  editingId: string | null;
  editingName: string;
  onStartEdit: (column: KanbanColumn) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  setEditingName: (name: string) => void;
  onDelete: (columnId: string) => void;
}

function DraggableColumnItem({
  column,
  index,
  moveColumn,
  editingId,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  setEditingName,
  onDelete,
}: DraggableColumnItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: DND_ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveColumn(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      data-testid={`status-item-${column.id}`}
    >
      {/* Drag Handle */}
      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing" data-testid={`drag-handle-${column.id}`} />

      {/* Icon */}
      <div 
        className="flex items-center justify-center w-8 h-8 rounded text-lg"
        style={{ backgroundColor: `${column.color}20` }}
      >
        {column.icon || '📋'}
      </div>

      {/* Name (editable) */}
      {editingId === column.id ? (
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="flex-1"
          autoFocus
          data-testid={`input-rename-${column.id}`}
        />
      ) : (
        <span className="flex-1 font-medium" data-testid={`status-name-${column.id}`}>
          {column.name}
        </span>
      )}

      {/* Three-dot Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`menu-${column.id}`}>
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid={`menu-content-${column.id}`}>
          <DropdownMenuItem
            onClick={() => onStartEdit(column)}
            data-testid={`menu-rename-${column.id}`}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename status
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(column.id)}
            className="text-red-600 dark:text-red-400"
            data-testid={`menu-delete-${column.id}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function EditStatusesModal({
  isOpen,
  onClose,
  columns,
  onReorder,
  onRename,
  onDelete,
  onAdd,
}: EditStatusesModalProps) {
  const [localColumns, setLocalColumns] = useState<KanbanColumn[]>(columns);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusIcon, setNewStatusIcon] = useState('📋');
  const [newStatusColor, setNewStatusColor] = useState('#6B7280');

  // Sync local columns with incoming columns whenever they change or modal opens
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns, isOpen]);

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const newColumns = [...localColumns];
    const [draggedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, draggedColumn);
    setLocalColumns(newColumns);
    onReorder(newColumns);
  };

  const handleStartEdit = (column: KanbanColumn) => {
    setEditingId(column.id);
    setEditingName(column.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleAddNew = () => {
    if (newStatusName.trim()) {
      onAdd(newStatusName.trim(), newStatusIcon, newStatusColor);
      setIsAddingNew(false);
      setNewStatusName('');
      setNewStatusIcon('📋');
      setNewStatusColor('#6B7280');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="modal-edit-statuses">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Edit statuses</DialogTitle>
        </DialogHeader>

        <DndProvider backend={HTML5Backend}>
          <div className="space-y-2 py-4">
            {localColumns.map((column, index) => (
              <DraggableColumnItem
                key={column.id}
                column={column}
                index={index}
                moveColumn={moveColumn}
                editingId={editingId}
                editingName={editingName}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                setEditingName={setEditingName}
                onDelete={onDelete}
              />
            ))}

          {/* Add New Status Button */}
          {!isAddingNew ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsAddingNew(true)}
              data-testid="button-add-status"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add new status
            </Button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800" data-testid="form-add-status">
              <GripVertical className="h-5 w-5 text-gray-400" />
              
              {/* Icon Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" data-testid="button-select-icon">
                    <span className="text-lg">{newStatusIcon}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {DEFAULT_ICONS.map((icon) => (
                    <DropdownMenuItem
                      key={icon.emoji}
                      onClick={() => setNewStatusIcon(icon.emoji)}
                      data-testid={`icon-${icon.name}`}
                    >
                      <span className="text-lg">{icon.emoji}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Name Input */}
              <Input
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="Status name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNew();
                  if (e.key === 'Escape') {
                    setIsAddingNew(false);
                    setNewStatusName('');
                  }
                }}
                autoFocus
                data-testid="input-new-status-name"
              />

              {/* Save Button */}
              <Button size="sm" onClick={handleAddNew} data-testid="button-save-new-status">
                Add
              </Button>
            </div>
          )}
          </div>
        </DndProvider>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white" data-testid="button-close-modal">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
