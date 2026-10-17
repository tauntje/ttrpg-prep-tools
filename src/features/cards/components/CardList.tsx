import type { Card } from "../../../types/card";
import { cardTitle } from "../model/card";

interface CardListProps {
  cards: Card[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInsert: () => void;
}

/**
 * Show the cards that are on the sheet. The user selects a card to edit it.
 */
export function CardList({ cards, selectedId, onSelect, onInsert }: CardListProps) {
  return (
    <div className="card-list">
      <div className="card-list-head">
        <h3>Cards</h3>
        <button type="button" onClick={onInsert}>
          Insert card
        </button>
      </div>
      {cards.length === 0 ? (
        <p className="card-list-empty">No cards. Select Insert card.</p>
      ) : (
        <ol className="card-list-items">
          {cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                className={card.id === selectedId ? "is-active" : undefined}
                onClick={() => onSelect(card.id)}
              >
                {cardTitle(card)}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
