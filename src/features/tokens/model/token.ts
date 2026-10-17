import type { SheetItemSize } from "../../../shared/model/sheet";
import type { Token, TokenSizeMm } from "../../../types/token";

export const TOKEN_SIZES_MM: TokenSizeMm[] = [25, 50, 75];
export const DEFAULT_TOKEN_SIZE_MM: TokenSizeMm = 25;
export const DEFAULT_RING_COLOUR = "#b26a4c";

export const TOKEN_GAP_MM = 5;
export const TOKEN_MARGIN_MM = 10;

export function tokenItemSize(sizeMm: TokenSizeMm): SheetItemSize {
  return { widthMm: sizeMm, heightMm: sizeMm };
}

export function createToken(): Token {
  return {
    id: crypto.randomUUID(),
    name: "",
    src: "",
    sizeMm: DEFAULT_TOKEN_SIZE_MM,
    ringColour: DEFAULT_RING_COLOUR,
    imageXMm: 0,
    imageYMm: 0,
    imageScale: 1,
  };
}
