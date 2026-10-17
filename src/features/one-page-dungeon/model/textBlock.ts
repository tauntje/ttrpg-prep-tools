import type { TextBlock, TextBlockThemeId, TextBlockType } from "../../../types/textBlock";

const DEFAULT_TITLE: Record<TextBlockType, string> = {
  information: "Information",
  dwellers: "Dwellers",
  legend: "Legend",
};

const DEFAULT_THEME: TextBlockThemeId = "terracotta";
const DEFAULT_WIDTH_MM = 70;
const DEFAULT_HEIGHT_MM = 30;
const OFFSET_STEP_MM = 8;
const OFFSET_LIMIT = 6;

export function createTextBlock(type: TextBlockType, index: number): TextBlock {
  const offset = (index % OFFSET_LIMIT) * OFFSET_STEP_MM;

  return {
    id: crypto.randomUUID(),
    type,
    title: DEFAULT_TITLE[type],
    subtitle: "",
    theme: DEFAULT_THEME,
    bullets: [],
    text: "",
    xMm: 20 + offset,
    yMm: 20 + offset,
    widthMm: DEFAULT_WIDTH_MM,
    heightMm: DEFAULT_HEIGHT_MM,
  };
}
