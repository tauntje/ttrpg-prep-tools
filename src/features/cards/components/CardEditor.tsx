import { TextControl } from "../../../shared/components/TextControl";
import type { Card } from "../../../types/card";

interface CardEditorProps {
  card: Card;
  onChange: (patch: Partial<Card>) => void;
}

/**
 * Edit the selected card on the page.
 * The fields cover the card on the screen only. The print shows the card.
 */
export function CardEditor({ card, onChange }: CardEditorProps) {
  return (
    <article className="card card-editor screen-only">
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
          rows={4}
          value={card.text}
          onChange={(text) => onChange({ text })}
        />
      </label>
    </article>
  );
}
