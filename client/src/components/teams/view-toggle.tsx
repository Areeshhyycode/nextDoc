import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'table' | 'kanban';
  onViewChange: (view: 'table' | 'kanban') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg" data-testid="view-toggle">
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="gap-2"
        data-testid="button-view-table"
      >
        <LayoutList className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={currentView === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className="gap-2"
        data-testid="button-view-kanban"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Kanban</span>
      </Button>
    </div>
  );
}
