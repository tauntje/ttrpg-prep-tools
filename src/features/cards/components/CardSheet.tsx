import type { PointerEvent as ReactPointerEvent } from "react";
import { nextSelection, selectionMode } from "../../../shared/model/multiSelection";
import { pageSizeForOrientation } from "../../../shared/model/page";
import { sheetSlot, splitIntoPages } from "../../../shared/model/sheet";
import type { Card } from "../../../types/card";
import type { PageOrientation } from "../../../types/page";
import { cardGrid } from "../model/card";
import { CardEditor } from "./CardEditor";
import { CardView } from "./CardView";

interface CardSheetProps {
  orientation: PageOrientation;
  cards: Card[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onUpdateCard: (id: string, patch: Partial<Card>) => void;
}

/**
 * Lay the cards on A4 pages. The cards fill each page in a grid.
 * Select one card to edit it. Select many cards for a bulk action.
 * Click the page to show the cards again.
 */
export function CardSheet({
  orientation,
  cards,
  selectedIds,
  onSelectionChange,
  onUpdateCard,
}: CardSheetProps) {
  const page = pageSizeForOrientation(orientation);
  const grid = cardGrid(orientation);
  const pages = splitIntoPages(grid, cards);
  const sheets: Card[][] = pages.length > 0 ? pages : [[]];
  const selected = new Set(selectedIds);
  const editId = selectedIds.length === 1 ? selectedIds[0] : null;
  const order = cards.map((card) => card.id);

  function handleBackgroundPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest(".card-slot") !== null) {
      return;
    }

    onSelectionChange([]);
  }

  function handleCardPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    card: Card
  ) {
    const mode = selectionMode(event);

    if (mode === "replace" && selectedIds.length === 1 && selectedIds[0] === card.id) {
      return;
    }

    onSelectionChange(nextSelection(selectedIds, order, card.id, mode));
  }

  return (
    <div className="card-sheet">
      {sheets.map((pageCards, pageIndex) => (
        <section
          key={pageIndex}
          className="page card-page"
          aria-label={`A4 page ${pageIndex + 1}, ${orientation}`}
          style={{ width: `${page.widthMm}mm`, height: `${page.heightMm}mm` }}
        >
          <div className="card-page-content" onPointerDown={handleBackgroundPointerDown}>
            {pageCards.length === 0 && (
              <p className="card-page-hint screen-only">
                Select Insert card to put a card on this page.
              </p>
            )}
            {pageCards.map((card, index) => {
              const slot = sheetSlot(grid, index);
              const isSelected = selected.has(card.id);

              return (
                <div
                  key={card.id}
                  className={`card-slot${isSelected ? " is-selected" : ""}${
                    card.id === editId ? " is-editing" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onPointerDown={(event) => handleCardPointerDown(event, card)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectionChange([card.id]);
                    }
                  }}
                  style={{
                    left: `${slot.xMm}mm`,
                    top: `${slot.yMm}mm`,
                    width: `${slot.widthMm}mm`,
                    height: `${slot.heightMm}mm`,
                  }}
                >
                  <CardView card={card} />
                  {card.id === editId && (
                    <CardEditor
                      card={card}
                      onChange={(patch) => onUpdateCard(card.id, patch)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
