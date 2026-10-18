export type SelectionMode = "replace" | "toggle" | "range";

interface ModifierKeys {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

/**
 * Read the selection mode from the pointer event.
 * Shift makes a range. Ctrl or Command makes a toggle. A plain click replaces.
 */
export function selectionMode(event: ModifierKeys): SelectionMode {
  if (event.shiftKey) {
    return "range";
  }

  if (event.ctrlKey || event.metaKey) {
    return "toggle";
  }

  return "replace";
}

/**
 * Return the ids to select after a click on one item.
 * The order gives the item positions for a range selection.
 */
export function nextSelection(
  current: string[],
  order: string[],
  id: string,
  mode: SelectionMode
): string[] {
  if (mode === "toggle") {
    if (current.includes(id)) {
      return current.filter((item) => item !== id);
    }

    return [...current, id];
  }

  if (mode === "range") {
    const anchor = current.length > 0 ? current[current.length - 1] : id;
    const from = order.indexOf(anchor);
    const to = order.indexOf(id);

    if (from < 0 || to < 0) {
      return [id];
    }

    const start = Math.min(from, to);
    const end = Math.max(from, to);
    return order.slice(start, end + 1);
  }

  return [id];
}

/**
 * Get the id for the editor. Use the last selected item.
 */
export function primaryId(ids: string[]): string | null {
  return ids.length === 0 ? null : ids[ids.length - 1];
}
