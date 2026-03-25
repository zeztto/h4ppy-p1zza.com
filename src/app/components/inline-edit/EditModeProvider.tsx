import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useAuth } from '@/app/admin/AuthContext';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = !!user;
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setIsEditMode((prev) => !prev);
  }, [isAdmin]);

  return (
    <EditModeContext.Provider value={{ isEditMode, toggleEditMode, isAdmin }}>
      {children}
    </EditModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}
