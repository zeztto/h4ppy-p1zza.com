import { useMemo, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { AdminProject } from '@/app/admin/types';

type KanbanMode = 'status' | 'category';

interface KanbanBoardProps {
  projects: AdminProject[];
  mode: KanbanMode;
  onProjectUpdate: (id: string, changes: Partial<AdminProject>) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
  onEdit: (project: AdminProject) => void;
  onToggle: (id: string, field: 'isPublished' | 'isFeatured') => void;
}

type StatusColumn = 'draft' | 'published' | 'featured';

function getStatusColumn(project: AdminProject): StatusColumn {
  if (project.isFeatured) return 'featured';
  if (project.isPublished) return 'published';
  return 'draft';
}

function getCategoryColumn(project: AdminProject): string {
  return project.category || '미분류';
}

const STATUS_COLUMNS: { id: StatusColumn; title: string }[] = [
  { id: 'draft', title: 'Draft' },
  { id: 'published', title: 'Published' },
  { id: 'featured', title: 'Featured' },
];

export function KanbanBoard({
  projects,
  mode,
  onProjectUpdate,
  onReorder,
  onEdit,
  onToggle,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const columns = useMemo(() => {
    if (mode === 'status') {
      const grouped: Record<StatusColumn, AdminProject[]> = {
        draft: [],
        published: [],
        featured: [],
      };
      for (const p of projects) {
        const col = getStatusColumn(p);
        grouped[col].push(p);
      }
      return STATUS_COLUMNS.map((col) => ({
        id: col.id,
        title: col.title,
        projects: grouped[col.id],
      }));
    }

    // category mode
    const grouped = new Map<string, AdminProject[]>();
    for (const p of projects) {
      const col = getCategoryColumn(p);
      const existing = grouped.get(col);
      if (existing) {
        existing.push(p);
      } else {
        grouped.set(col, [p]);
      }
    }
    return Array.from(grouped.entries()).map(([id, items]) => ({
      id,
      title: id,
      projects: items,
    }));
  }, [projects, mode]);

  const activeProject = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  const findColumnForProject = useCallback(
    (projectId: string): string | null => {
      for (const col of columns) {
        if (col.projects.some((p) => p.id === projectId)) {
          return col.id;
        }
      }
      return null;
    },
    [columns],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable's isOver
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);

      const sourceColId = findColumnForProject(activeIdStr);

      // Determine target column: if over.id is a column id, use it; otherwise find the column of the target card
      const targetColId = columns.some((c) => c.id === overIdStr)
        ? overIdStr
        : findColumnForProject(overIdStr);

      if (!sourceColId || !targetColId) return;

      // Same column: reorder
      if (sourceColId === targetColId) {
        const col = columns.find((c) => c.id === sourceColId);
        if (!col) return;
        const oldIndex = col.projects.findIndex((p) => p.id === activeIdStr);
        const newIndex = col.projects.findIndex((p) => p.id === overIdStr);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reordered = arrayMove(col.projects, oldIndex, newIndex);
        // Build full new order across all columns
        const newOrder: string[] = [];
        for (const c of columns) {
          if (c.id === sourceColId) {
            for (const p of reordered) newOrder.push(p.id);
          } else {
            for (const p of c.projects) newOrder.push(p.id);
          }
        }
        await onReorder(newOrder);
        return;
      }

      // Cross-column drag: apply state changes
      if (mode === 'status') {
        const changes = getStatusChanges(
          sourceColId as StatusColumn,
          targetColId as StatusColumn,
        );
        if (changes) {
          await onProjectUpdate(activeIdStr, changes);
        }
      } else {
        // Category mode: change category
        const newCategory = targetColId === '미분류' ? '' : targetColId;
        await onProjectUpdate(activeIdStr, { category: newCategory });
      }
    },
    [columns, findColumnForProject, mode, onProjectUpdate, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            projects={col.projects}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="opacity-80 rotate-2">
            <KanbanCard
              project={activeProject}
              onToggle={() => {}}
              onEdit={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getStatusChanges(
  source: StatusColumn,
  target: StatusColumn,
): Partial<AdminProject> | null {
  if (source === target) return null;

  switch (`${source}->${target}`) {
    case 'draft->published':
      return { isPublished: true };
    case 'draft->featured':
      return { isPublished: true, isFeatured: true };
    case 'published->featured':
      return { isFeatured: true };
    case 'published->draft':
      return { isPublished: false, isFeatured: false };
    case 'featured->published':
      return { isFeatured: false };
    case 'featured->draft':
      return { isPublished: false, isFeatured: false };
    default:
      return null;
  }
}
