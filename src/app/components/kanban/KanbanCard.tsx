import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/app/components/ui/badge';
import type { AdminProject } from '@/app/admin/types';

interface KanbanCardProps {
  project: AdminProject;
  onToggle: (id: string, field: 'isPublished' | 'isFeatured') => void;
  onEdit: (project: AdminProject) => void;
}

export function KanbanCard({ project, onToggle, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
    >
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="h-10 w-10 rounded object-cover shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-muted shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <button
          type="button"
          className="font-medium text-sm truncate block text-left hover:text-primary transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(project)}
        >
          {project.name}
        </button>
        <div className="flex items-center gap-1.5 mt-0.5">
          {project.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {project.category}
            </Badge>
          )}
          {project.year && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {project.year}
            </Badge>
          )}
        </div>
      </div>

      <div
        className="flex flex-col gap-1 shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={project.isPublished}
            onChange={() => onToggle(project.id, 'isPublished')}
            className="rounded h-3 w-3"
          />
          공개
        </label>
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={project.isFeatured}
            onChange={() => onToggle(project.id, 'isFeatured')}
            className="rounded h-3 w-3"
          />
          추천
        </label>
      </div>
    </div>
  );
}
