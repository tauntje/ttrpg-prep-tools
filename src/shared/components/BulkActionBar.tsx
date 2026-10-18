import type { ReactNode } from "react";

interface BulkActionBarProps {
  count: number;
  children: ReactNode;
  onClear: () => void;
}

/**
 * Show the actions for a multiple selection.
 * The bar is visible on the screen only. The print does not show it.
 */
export function BulkActionBar({ count, children, onClear }: BulkActionBarProps) {
  if (count === 0) {
    return null;
  }

  return (
    <div
      className="bulk-action-bar screen-only"
      role="toolbar"
      aria-label="Selection actions"
    >
      <span className="bulk-action-count">{count} selected</span>
      <div className="bulk-action-buttons">{children}</div>
      <button type="button" className="bulk-action-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
