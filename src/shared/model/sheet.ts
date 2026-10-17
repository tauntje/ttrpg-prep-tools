import type { PageSize } from "../../types/page";

export interface SheetItemSize {
  widthMm: number;
  heightMm: number;
}

export interface SheetSlot {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface SheetGrid {
  columns: number;
  rows: number;
  perPage: number;
  gapMm: number;
  marginMm: number;
  itemWidthMm: number;
  itemHeightMm: number;
}

export const DEFAULT_SHEET_GAP_MM = 5;
export const DEFAULT_SHEET_MARGIN_MM = 10;

/**
 * Count the columns and the rows that fit on one page.
 * The grid keeps the gap between the items and the margin at the page edge.
 */
export function sheetGrid(
  page: PageSize,
  item: SheetItemSize,
  gapMm: number = DEFAULT_SHEET_GAP_MM,
  marginMm: number = DEFAULT_SHEET_MARGIN_MM
): SheetGrid {
  const base = {
    gapMm,
    marginMm,
    itemWidthMm: item.widthMm,
    itemHeightMm: item.heightMm,
  };

  if (item.widthMm <= 0 || item.heightMm <= 0) {
    return { ...base, columns: 0, rows: 0, perPage: 0 };
  }

  const usableWidthMm = Math.max(page.widthMm - marginMm * 2, 0);
  const usableHeightMm = Math.max(page.heightMm - marginMm * 2, 0);
  const columns = Math.max(Math.floor((usableWidthMm + gapMm) / (item.widthMm + gapMm)), 0);
  const rows = Math.max(Math.floor((usableHeightMm + gapMm) / (item.heightMm + gapMm)), 0);

  return { ...base, columns, rows, perPage: columns * rows };
}

/**
 * Get the top left corner and the size of one grid cell.
 */
export function sheetSlot(grid: SheetGrid, index: number): SheetSlot {
  const base = {
    widthMm: grid.itemWidthMm,
    heightMm: grid.itemHeightMm,
  };

  if (grid.columns <= 0) {
    return { ...base, xMm: grid.marginMm, yMm: grid.marginMm };
  }

  const column = index % grid.columns;
  const row = Math.floor(index / grid.columns);

  return {
    ...base,
    xMm: grid.marginMm + column * (grid.itemWidthMm + grid.gapMm),
    yMm: grid.marginMm + row * (grid.itemHeightMm + grid.gapMm),
  };
}

/**
 * Count the pages that hold all items.
 */
export function sheetPageCount(grid: SheetGrid, itemCount: number): number {
  if (itemCount <= 0) {
    return 0;
  }

  if (grid.perPage <= 0) {
    return 1;
  }

  return Math.ceil(itemCount / grid.perPage);
}

/**
 * Split the items into groups. Each group fills one page.
 */
export function splitIntoPages<T>(grid: SheetGrid, items: T[]): T[][] {
  const perPage = Math.max(grid.perPage, 1);
  const pages: T[][] = [];

  for (let start = 0; start < items.length; start += perPage) {
    pages.push(items.slice(start, start + perPage));
  }

  return pages;
}
