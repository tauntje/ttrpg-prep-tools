import { TextControl } from "../../../shared/components/TextControl";
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
        <TextControl value={card.title} onChange={(title) => onChange({ title })} />
      </label>
      <label className="card-field">
        Subtitle
        <TextControl
          value={card.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
        />
      </label>
      <label className="card-field">
        Text
        <TextControl
          multiline
          rows={5}
          value={card.text}
          onChange={(text) => onChange({ text })}
        />
      </label>
      <button type="button" className="card-delete" onClick={onDelete}>
        Remove card
      </button>
    </div>
  );
}
