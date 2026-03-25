import { Plus } from 'lucide-react';
import { useEditMode } from './EditModeProvider';

interface SectionAdderProps {
  onAdd: () => void;
}

export function SectionAdder({ onAdd }: SectionAdderProps) {
  const { isEditMode } = useEditMode();

  if (!isEditMode) return null;

  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Dashed line */}
      <div className="absolute inset-x-8 top-1/2 border-t border-dashed border-muted-foreground/30" />

      {/* Circle button */}
      <button
        onClick={onAdd}
        className="relative z-10 flex items-center justify-center size-8 rounded-full border-2 border-dashed border-muted-foreground/40 bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        aria-label="Add section"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
