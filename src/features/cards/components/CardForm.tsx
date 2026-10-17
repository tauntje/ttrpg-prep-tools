import type { Card } from "../../../types/card";

interface CardFormProps {
  card: Card;
  onChange: (patch: Partial<Card>) => void;
  onDelete: () => void;
}

/**
 * Edit the selected card. Each change shows on the sheet at once.
 */
export function CardForm({ card, onChange, onDelete }: CardFormProps) {
  return (
    <div className="card-form">
      <h3>Card</h3>
      <label className="card-field">
        Title
        <input
          type="text"
          value={card.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>
      <label className="card-field">
        Subtitle
        <input
          type="text"
          value={card.subtitle}
          onChange={(event) => onChange({ subtitle: event.target.value })}
        />
      </label>
      <label className="card-field">
        Text
        <textarea
          rows={5}
          value={card.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </label>
      <button type="button" className="card-delete" onClick={onDelete}>
        Remove card
      </button>
    </div>
  );
}
