import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import type { AdminProject } from '@/app/admin/types';

interface GridPreviewProps {
  projects: AdminProject[];
  columns: number;
  onReorder: (ids: string[]) => Promise<void>;
  onEdit: (project: AdminProject) => void;
}

function SortableGridCard({
  project,
  onEdit,
}: {
  project: AdminProject;
  onEdit: (project: AdminProject) => void;
}) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card rounded-xl border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all"
    >
      <div className="aspect-video rounded-t-xl overflow-hidden bg-muted">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground/60">
              {project.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        {project.category && (
          <Badge variant="secondary" className="text-xs">
            {project.category}
          </Badge>
        )}
        <button
          type="button"
          className="font-semibold text-sm text-foreground mt-1.5 line-clamp-1 block text-left hover:text-primary transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(project)}
        >
          {project.name}
        </button>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {project.description}
        </p>
      </div>
    </div>
  );
}

function GridOverlayCard({ project }: { project: AdminProject }) {
  return (
    <div className="bg-card rounded-xl border border-primary/50 shadow-lg opacity-90 rotate-1">
      <div className="aspect-video rounded-t-xl overflow-hidden bg-muted">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground/60">
              {project.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-1">{project.name}</p>
      </div>
    </div>
  );
}

export function GridPreview({ projects, columns, onReorder, onEdit }: GridPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const projectIds = projects.map((p) => p.id);

  const activeProject = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = projects.findIndex((p) => p.id === String(active.id));
      const newIndex = projects.findIndex((p) => p.id === String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(projects, oldIndex, newIndex);
      await onReorder(reordered.map((p) => p.id));
    },
    [projects, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <SortableContext items={projectIds} strategy={rectSortingStrategy}>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${String(columns)}, 1fr)` }}
        >
          {projects.map((project) => (
            <SortableGridCard
              key={project.id}
              project={project}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeProject ? <GridOverlayCard project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
