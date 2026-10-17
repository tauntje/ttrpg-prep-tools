import { TextControl } from "../../../shared/components/TextControl";
import type { Card } from "../../../types/card";

interface CardFormProps {
  card: Card;
  isUnsaved: boolean;
  onChange: (patch: Partial<Card>) => void;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Edit the selected card. Each change shows on the sheet at once.
 * The Save action writes the card to the library.
 */
export function CardForm({ card, isUnsaved, onChange, onSave, onDelete }: CardFormProps) {
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
      <p className="card-save-state">{isUnsaved ? "Not saved" : "Saved"}</p>
      <div className="card-form-actions">
        <button
          type="button"
          className="card-save"
          disabled={!isUnsaved}
          onClick={onSave}
        >
          Save
        </button>
        <button type="button" className="card-delete" onClick={onDelete}>
          Remove card
        </button>
      </div>
    </div>
  );
}
