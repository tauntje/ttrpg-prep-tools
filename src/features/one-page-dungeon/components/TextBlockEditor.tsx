import type { TextBlock, TextBlockThemeId } from "../../../types/textBlock";
import { TextControl } from "../../../shared/components/TextControl";
import { TEXT_BLOCK_THEME_LIST } from "../model/textBlockTheme";

export type TextBlockField = "title" | "subtitle" | "body";

interface TextBlockEditorProps {
  textBlock: TextBlock;
  field: TextBlockField;
  onChange: (patch: Partial<TextBlock>) => void;
}

/**
 * Edit the selected text block on the page.
 * The fields cover the block on the screen only. The print shows the block.
 */
export function TextBlockEditor({ textBlock, field, onChange }: TextBlockEditorProps) {
  return (
    <div className="text-block-editor screen-only">
      <div className="text-block-editor-head">
        <span className="text-block-editor-handle" aria-hidden="true">
          Text block
        </span>
        <select
          className="text-block-editor-theme"
          aria-label="Colour"
          value={textBlock.theme}
          onChange={(event) => onChange({ theme: event.target.value as TextBlockThemeId })}
        >
          {TEXT_BLOCK_THEME_LIST.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>
      <label className="text-block-field">
        Title
        <TextControl
          autoFocus={field === "title"}
          value={textBlock.title}
          onChange={(title) => onChange({ title })}
        />
      </label>
      <label className="text-block-field">
        Subtitle
        <TextControl
          autoFocus={field === "subtitle"}
          value={textBlock.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
        />
      </label>
      <label className="text-block-field">
        Content
        <TextControl
          autoFocus={field === "body"}
          multiline
          rows={4}
          value={textBlock.text}
          onChange={(text) => onChange({ text })}
        />
      </label>
    </div>
  );
}
