import { X } from 'lucide-react';
import { classes } from './classes';

export function ClearButton({
  label,
  onClear,
  beforeArrow = false,
  tabIndex,
}: {
  label: string;
  onClear: () => void;
  beforeArrow?: boolean;
  tabIndex?: number;
}) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      aria-label={label}
      className={classes('leaf-picker-clear', beforeArrow && 'leaf-picker-clear--before-arrow')}
      onClick={onClear}
    >
      <X size={13} aria-hidden="true" />
    </button>
  );
}
