export interface TextEdit {
  value: string;
  caret: number;
}

function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && /\s/.test(character);
}

export function deletePreviousWord(value: string, start: number, end: number): TextEdit {
  if (start !== end) {
    return { value: value.slice(0, start) + value.slice(end), caret: start };
  }

  let caret = start;
  while (caret > 0 && isWhitespace(value[caret - 1])) {
    caret -= 1;
  }
  while (caret > 0 && !isWhitespace(value[caret - 1])) {
    caret -= 1;
  }

  return { value: value.slice(0, caret) + value.slice(start), caret };
}
