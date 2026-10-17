import type { SheetItemSize } from "../../../shared/model/sheet";
import type { Card } from "../../../types/card";

export const CARD_SIZE_MM: SheetItemSize = {
  widthMm: 60,
  heightMm: 80,
};

export const CARD_GAP_MM = 5;
export const CARD_MARGIN_MM = 10;

export function createCard(): Card {
  return {
    id: crypto.randomUUID(),
    title: "New card",
    subtitle: "",
    text: "",
  };
}
