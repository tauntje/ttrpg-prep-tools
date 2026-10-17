import type { PageOrientation, PageSize } from "../../types/page";

export const A4_PORTRAIT: PageSize = {
  widthMm: 210,
  heightMm: 297,
};

export const A4_LANDSCAPE: PageSize = {
  widthMm: 297,
  heightMm: 210,
};

export const DEFAULT_ORIENTATION: PageOrientation = "landscape";

export function pageSizeForOrientation(orientation: PageOrientation): PageSize {
  return orientation === "portrait" ? A4_PORTRAIT : A4_LANDSCAPE;
}

export const DEFAULT_PAGE: PageSize = pageSizeForOrientation(DEFAULT_ORIENTATION);

/**
 * Make the CSS page rule for the print output.
 * The active tab renders this rule. The other tabs do not.
 */
export function pageRule(orientation: PageOrientation): string {
  return `@page { size: A4 ${orientation}; }`;
}
