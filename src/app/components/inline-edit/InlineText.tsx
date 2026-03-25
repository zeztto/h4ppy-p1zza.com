import { useRef, useState, useEffect, useCallback, type KeyboardEvent, type createElement } from 'react';
import { useEditMode } from './EditModeProvider';
import { useAutoSave } from '@/app/hooks/useAutoSave';

type TagName = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface InlineTextProps {
  value: string;
  onSave: (newValue: string) => void;
  tag?: TagName;
  className?: string;
}

export function InlineText({ value, onSave, tag: Tag = 'span', className = '' }: InlineTextProps) {
  const { isEditMode } = useEditMode();
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const originalValue = useRef(value);

  const asyncSave = useCallback(
    async (v: string) => {
      onSave(v);
    },
    [onSave],
  );
  const debouncedSave = useAutoSave(asyncSave, 1000);

  // Sync original value when value prop changes
  useEffect(() => {
    originalValue.current = value;
  }, [value]);

  if (!isEditMode) {
    // Render the tag as a simple element
    const props = { className } as Parameters<typeof createElement>[1];
    return <Tag {...props}>{value}</Tag>;
  }

  const handleFocus = () => {
    setEditing(true);
    originalValue.current = value;
  };

  const handleBlur = () => {
    setEditing(false);
    const newValue = ref.current?.textContent ?? '';
    if (newValue !== originalValue.current) {
      debouncedSave(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (ref.current) {
        ref.current.textContent = originalValue.current;
      }
      ref.current?.blur();
      setEditing(false);
    }
  };

  const editClassName = [
    className,
    'outline-none',
    editing ? 'ring-2 ring-blue-400 rounded' : 'underline decoration-dashed decoration-blue-300 underline-offset-4',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={editClassName}
    >
      {value}
    </Tag>
  );
}
