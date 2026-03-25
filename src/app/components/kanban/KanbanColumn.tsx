import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/app/components/ui/badge';
import { KanbanCard } from './KanbanCard';
import type { AdminProject } from '@/app/admin/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  projects: AdminProject[];
  onToggle: (id: string, field: 'isPublished' | 'isFeatured') => void;
  onEdit: (project: AdminProject) => void;
}

export function KanbanColumn({ id, title, projects, onToggle, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const projectIds = projects.map((p) => p.id);

  return (
    <div
      className={`flex flex-col bg-muted/50 rounded-xl border border-border min-w-[280px] max-w-[350px] flex-1 transition-colors ${
        isOver ? 'border-primary/50 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {projects.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)] min-h-[100px]"
      >
        <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <KanbanCard
              key={project.id}
              project={project}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </SortableContext>
        {projects.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
            드래그하여 이동
          </div>
        )}
      </div>
    </div>
  );
}
