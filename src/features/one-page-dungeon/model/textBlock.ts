import type { Pin } from "../../../types/pin";
import type { TextBlock, TextBlockThemeId, TextBlockType } from "../../../types/textBlock";

const DEFAULT_TITLE: Record<TextBlockType, string> = {
  context: "Context",
  dwellers: "Dwellers",
  legend: "Legend",
};

const DEFAULT_THEME: TextBlockThemeId = "terracotta";

export function createTextBlock(type: TextBlockType): TextBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title: DEFAULT_TITLE[type],
    subtitle: "",
    theme: DEFAULT_THEME,
    bullets: [],
    text: "",
  };
}

/**
 * Set the title of each linked text block to the pin number.
 */
export function syncLegendTitles(
  pins: Pin[],
  textBlocks: TextBlock[]
): TextBlock[] {
  return textBlocks.map((textBlock) => {
    if (textBlock.pinId === undefined) {
      return textBlock;
    }

    const pin = pins.find((item) => item.id === textBlock.pinId);
    if (pin === undefined) {
      return textBlock;
    }

    return { ...textBlock, title: String(pin.number) };
  });
}
