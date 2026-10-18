import type { ChangeEvent, KeyboardEvent } from "react";
import { deletePreviousWord } from "../model/textEditing";

interface TextControlProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  autoFocus?: boolean;
}

export function TextControl({
  value,
  onChange,
  multiline = false,
  rows,
  autoFocus = false,
}: TextControlProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!event.ctrlKey || event.key.toLowerCase() !== "w") {
      return;
    }

    event.preventDefault();

    const target = event.currentTarget;
    const edit = deletePreviousWord(
      target.value,
      target.selectionStart ?? 0,
      target.selectionEnd ?? 0
    );
    onChange(edit.value);
    requestAnimationFrame(() => target.setSelectionRange(edit.caret, edit.caret));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value}
        autoFocus={autoFocus}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      autoFocus={autoFocus}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
