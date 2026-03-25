interface GridColumnControlProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
}

export function GridColumnControl({ label, value, onChange }: GridColumnControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground whitespace-nowrap">
        {label}
      </label>
      <input
        type="range"
        min={1}
        max={4}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 accent-primary"
      />
      <span className="text-sm font-mono text-muted-foreground w-6 text-center">
        {value}
      </span>
    </div>
  );
}
