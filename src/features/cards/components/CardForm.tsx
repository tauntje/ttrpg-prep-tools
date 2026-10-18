interface CardFormProps {
  isUnsaved: boolean;
  onSave: () => void;
  onDelete: () => void;
}

/**
 * Show the actions for the selected card.
 * Edit the card fields on the sheet. The Save action writes the card to the library.
 */
export function CardForm({ isUnsaved, onSave, onDelete }: CardFormProps) {
  return (
    <div className="card-form">
      <h3>Card</h3>
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
