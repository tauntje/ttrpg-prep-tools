import type { TextBlock, TextBlockThemeId } from "../../../types/textBlock";
import { TextControl } from "../../../shared/components/TextControl";
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
        <TextControl
          value={textBlock.title}
          onChange={(title) => onChange({ title })}
        />
      </label>
      <label className="text-block-field">
        Subtitle
        <TextControl
          value={textBlock.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
        />
      </label>
      <label className="text-block-field">
        Content
        <TextControl
          multiline
          rows={4}
          value={textBlock.text}
          onChange={(text) => onChange({ text })}
        />
      </label>
    </div>
  );
}
