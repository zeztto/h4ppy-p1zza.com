import { Link } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { useEditMode } from './EditModeProvider';

export function EditModeFAB() {
  const { isAdmin, isEditMode, toggleEditMode } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden lg:flex flex-col items-center gap-2">
      <button
        onClick={toggleEditMode}
        className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
        aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
      >
        {isEditMode ? <X className="size-5" /> : <Pencil className="size-5" />}
      </button>
      <Link
        to="/admin"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        어드민
      </Link>
    </div>
  );
}
