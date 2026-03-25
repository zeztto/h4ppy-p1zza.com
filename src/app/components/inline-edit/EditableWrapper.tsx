import type { ReactNode, MouseEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from './EditModeProvider';

interface EditableWrapperProps {
  children: ReactNode;
  onEdit: () => void;
  className?: string;
}

export function EditableWrapper({ children, onEdit, className = '' }: EditableWrapperProps) {
  const { isEditMode } = useEditMode();

  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
      className={`group relative cursor-pointer border-2 border-transparent hover:border-dashed hover:border-blue-400 rounded transition-colors ${className}`}
    >
      {children}
      <span className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center size-6 rounded bg-blue-500 text-white">
        <Pencil className="size-3" />
      </span>
    </div>
  );
}
