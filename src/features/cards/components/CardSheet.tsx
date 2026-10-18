import type { PointerEvent as ReactPointerEvent } from "react";
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
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateCard: (id: string, patch: Partial<Card>) => void;
}

/**
 * Lay the cards on A4 pages. The cards fill each page in a grid.
 * Select a card on the sheet to edit it. Click the page to show the card again.
 */
export function CardSheet({
  orientation,
  cards,
  selectedId,
  onSelect,
  onUpdateCard,
}: CardSheetProps) {
  const page = pageSizeForOrientation(orientation);
  const grid = cardGrid(orientation);
  const pages = splitIntoPages(grid, cards);
  const sheets: Card[][] = pages.length > 0 ? pages : [[]];

  function handleBackgroundPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest(".card-slot") !== null) {
      return;
    }

    onSelect(null);
  }

  function handleCardPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    card: Card
  ) {
    if (selectedId === card.id) {
      return;
    }

    // Keep the focus on the slot. A Backspace then removes the card.
    event.preventDefault();
    event.currentTarget.focus();
    onSelect(card.id);
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
              const selected = card.id === selectedId;

              return (
                <div
                  key={card.id}
                  className={`card-slot${selected ? " is-selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onPointerDown={(event) => handleCardPointerDown(event, card)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(card.id);
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
                  {selected && (
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
