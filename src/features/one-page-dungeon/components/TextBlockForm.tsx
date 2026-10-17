import type { TextBlock, TextBlockThemeId } from "../../../types/textBlock";
import { TEXT_BLOCK_THEME_LIST } from "../model/textBlockTheme";

interface TextBlockFormProps {
  textBlock: TextBlock;
  onChange: (patch: Partial<TextBlock>) => void;
}

export function TextBlockForm({ textBlock, onChange }: TextBlockFormProps) {
  return (
    <div className="text-block-form">
      <h3>Text block</h3>
      <label className="text-block-field">
        Colour
        <select
          value={textBlock.theme}
          onChange={(event) => onChange({ theme: event.target.value as TextBlockThemeId })}
        >
          {TEXT_BLOCK_THEME_LIST.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-block-field">
        Title
        <input
          type="text"
          value={textBlock.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>
      <label className="text-block-field">
        Subtitle
        <input
          type="text"
          value={textBlock.subtitle}
          onChange={(event) => onChange({ subtitle: event.target.value })}
        />
      </label>
      <label className="text-block-field">
        Content
        <textarea
          rows={4}
          value={textBlock.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </label>
    </div>
  );
}
