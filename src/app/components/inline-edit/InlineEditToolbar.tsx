import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { useEditMode } from './EditModeProvider';

interface InlineEditToolbarProps {
  sectionName: string;
  sectionId: string;
  enabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function InlineEditToolbar({
  sectionName,
  sectionId,
  enabled,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onEdit,
  onDelete,
}: InlineEditToolbarProps) {
  const { isEditMode } = useEditMode();

  if (!isEditMode) return null;

  const handleDelete = () => {
    if (window.confirm(`"${sectionName}" 섹션을 삭제하시겠습니까?`)) {
      onDelete();
    }
  };

  return (
    <div data-section-id={sectionId} className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-sm border border-border">
      <span className="text-xs font-medium text-muted-foreground mr-2 select-none">
        {sectionName}
      </span>

      {/* Move up */}
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move section up"
      >
        <ArrowUp className="size-3.5" />
      </button>

      {/* Move down */}
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move section down"
      >
        <ArrowDown className="size-3.5" />
      </button>

      {/* Toggle enabled */}
      <button
        onClick={onToggleEnabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? 'Disable section' : 'Enable section'}
      >
        <span
          className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </button>

      {/* Edit */}
      <button
        onClick={onEdit}
        className="p-1 rounded hover:bg-muted"
        aria-label="Edit section"
      >
        <Pencil className="size-3.5" />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
        aria-label="Delete section"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
