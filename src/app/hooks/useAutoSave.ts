import { useRef, useCallback } from 'react';

export function useAutoSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay = 1000
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestValueRef = useRef<T>(undefined as T);
  const inflightRef = useRef(false);

  const save = useCallback(
    (value: T) => {
      latestValueRef.current = value;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        if (inflightRef.current) return;
        inflightRef.current = true;
        const saving = latestValueRef.current!;
        try {
          await saveFn(saving);
        } finally {
          inflightRef.current = false;
          if (latestValueRef.current !== saving) {
            // Value changed during save — trigger another save
            save(latestValueRef.current as T);
          }
        }
      }, delay);
    },
    [saveFn, delay],
  );

  return save;
}
