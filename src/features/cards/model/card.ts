import { pageSizeForOrientation } from "../../../shared/model/page";
import { sheetGrid, type SheetGrid, type SheetItemSize } from "../../../shared/model/sheet";
import type { Card } from "../../../types/card";
import type { PageOrientation } from "../../../types/page";

export const CARD_SIZE_MM: SheetItemSize = {
  widthMm: 60,
  heightMm: 80,
};

export const CARD_GAP_MM = 5;
export const CARD_MARGIN_MM = 10;

/**
 * Get the card grid for one page in the given orientation.
 */
export function cardGrid(orientation: PageOrientation): SheetGrid {
  return sheetGrid(
    pageSizeForOrientation(orientation),
    CARD_SIZE_MM,
    CARD_GAP_MM,
    CARD_MARGIN_MM
  );
}

export function createCard(): Card {
  return {
    id: crypto.randomUUID(),
    title: "New card",
    subtitle: "",
    text: "",
  };
}

/**
 * Get the name for the card list. Use a fallback for an empty title.
 */
export function cardTitle(card: Card): string {
  return card.title.trim() !== "" ? card.title : "Untitled card";
}
