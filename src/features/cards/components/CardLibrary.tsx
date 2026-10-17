import type { Card } from "../../../types/card";
import { cardTitle } from "../model/card";
import { CardView } from "./CardView";

interface CardLibraryProps {
  cards: Card[];
  onLoad: (card: Card) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/**
 * Show the saved cards. Each row shows a preview and a name.
 * The Load action copies the card to the sheet. The Delete action removes the row.
 */
export function CardLibrary({ cards, onLoad, onDelete, onClose }: CardLibraryProps) {
  return (
    <div className="card-library">
      <div className="card-list-head">
        <h3>Card library</h3>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {cards.length === 0 ? (
        <p className="card-list-empty">No saved cards.</p>
      ) : (
        <ul className="card-library-items">
          {cards.map((card) => (
            <li key={card.id} className="card-library-item">
              <div
                className="card-preview"
                style={{ width: "60mm", height: "80mm", zoom: 0.4 }}
              >
                <CardView card={card} />
              </div>
              <div className="card-library-meta">
                <span className="card-library-name">{cardTitle(card)}</span>
                <div className="card-library-actions">
                  <button type="button" onClick={() => onLoad(card)}>
                    Load
                  </button>
                  <button
                    type="button"
                    className="card-delete"
                    onClick={() => onDelete(card.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
