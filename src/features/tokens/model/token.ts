import { pageSizeForOrientation } from "../../../shared/model/page";
import {
  sheetGrid,
  splitIntoPages,
  type SheetGrid,
  type SheetItemSize,
} from "../../../shared/model/sheet";
import type { PageOrientation } from "../../../types/page";
import type { Token, TokenSizeMm } from "../../../types/token";

export const TOKEN_SIZES_MM: TokenSizeMm[] = [25, 50, 75];
export const DEFAULT_TOKEN_SIZE_MM: TokenSizeMm = 25;
export const DEFAULT_RING_COLOUR = "#b26a4c";

export const TOKEN_GAP_MM = 5;
export const TOKEN_MARGIN_MM = 10;

export const MIN_IMAGE_SCALE = 1;
export const MAX_IMAGE_SCALE = 4;

const RING_RATIO = 0.06;
const MIN_RING_MM = 0.6;

export interface TokenPage {
  sizeMm: TokenSizeMm;
  grid: SheetGrid;
  tokens: Token[];
}

export function tokenItemSize(sizeMm: TokenSizeMm): SheetItemSize {
  return { widthMm: sizeMm, heightMm: sizeMm };
}

/**
 * Get the token grid for one page in the given orientation.
 */
export function tokenGrid(orientation: PageOrientation, sizeMm: TokenSizeMm): SheetGrid {
  return sheetGrid(
    pageSizeForOrientation(orientation),
    tokenItemSize(sizeMm),
    TOKEN_GAP_MM,
    TOKEN_MARGIN_MM
  );
}

/**
 * Group the tokens by size. Each size fills its own A4 pages.
 */
export function tokenPages(orientation: PageOrientation, tokens: Token[]): TokenPage[] {
  const pages: TokenPage[] = [];

  for (const sizeMm of TOKEN_SIZES_MM) {
    const grid = tokenGrid(orientation, sizeMm);
    const group = tokens.filter((token) => token.sizeMm === sizeMm);

    for (const pageTokens of splitIntoPages(grid, group)) {
      pages.push({ sizeMm, grid, tokens: pageTokens });
    }
  }

  return pages;
}

export function createToken(src: string, name: string, imageAspect: number): Token {
  return {
    id: crypto.randomUUID(),
    name,
    src,
    sizeMm: DEFAULT_TOKEN_SIZE_MM,
    ringColour: DEFAULT_RING_COLOUR,
    imageAspect,
    imageXMm: 0,
    imageYMm: 0,
    imageScale: 1,
  };
}

/**
 * Get the name for the token list. Use a fallback for an empty name.
 */
export function tokenTitle(token: Token): string {
  return token.name.trim() !== "" ? token.name : "Untitled token";
}

export function tokenSizeLabel(sizeMm: TokenSizeMm): string {
  return `${sizeMm / 10} cm`;
}

export function ringWidthMm(sizeMm: TokenSizeMm): number {
  return Math.max(sizeMm * RING_RATIO, MIN_RING_MM);
}

/**
 * Get the smallest picture size that fills the token circle.
 * The aspect ratio is the picture height divided by the width.
 */
export function imageBaseSize(sizeMm: TokenSizeMm, imageAspect: number): SheetItemSize {
  const aspect = imageAspect > 0 ? imageAspect : 1;

  if (aspect >= 1) {
    return { widthMm: sizeMm, heightMm: sizeMm * aspect };
  }

  return { widthMm: sizeMm / aspect, heightMm: sizeMm };
}

export function imageRenderSize(token: Token): SheetItemSize {
  const base = imageBaseSize(token.sizeMm, token.imageAspect);

  return {
    widthMm: base.widthMm * token.imageScale,
    heightMm: base.heightMm * token.imageScale,
  };
}

/**
 * Keep the picture over the token circle.
 * The offset is the picture centre against the token centre.
 */
export function clampImageOffset(
  token: Token,
  xMm: number,
  yMm: number
): { xMm: number; yMm: number } {
  const render = imageRenderSize(token);
  const limitXMm = Math.max((render.widthMm - token.sizeMm) / 2, 0);
  const limitYMm = Math.max((render.heightMm - token.sizeMm) / 2, 0);

  return {
    xMm: Math.min(Math.max(xMm, -limitXMm), limitXMm),
    yMm: Math.min(Math.max(yMm, -limitYMm), limitYMm),
  };
}
