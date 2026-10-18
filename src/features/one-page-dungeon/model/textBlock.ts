import type { PlacedImage } from "../../../types/image";
import type { PageSize } from "../../../types/page";
import type { Pin } from "../../../types/pin";
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
const LEGEND_GAP_MM = 4;
const LEGEND_MARGIN_MM = 4;

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

/**
 * Put a legend block in the free space near the map.
 * Use the right side first, then the bottom side. The block stays on the page.
 */
export function legendPosition(
  block: TextBlock,
  image: PlacedImage,
  page: PageSize,
  index: number
): { xMm: number; yMm: number } {
  const rightXMm = image.xMm + image.widthMm + LEGEND_GAP_MM;
  const rightFits = rightXMm + block.widthMm <= page.widthMm - LEGEND_MARGIN_MM;
  if (rightFits) {
    const maxYMm = Math.max(page.heightMm - block.heightMm - LEGEND_MARGIN_MM, LEGEND_MARGIN_MM);
    const stackedY = LEGEND_MARGIN_MM + index * (block.heightMm + LEGEND_GAP_MM);
    return { xMm: rightXMm, yMm: Math.min(stackedY, maxYMm) };
  }

  const belowYMm = image.yMm + image.heightMm + LEGEND_GAP_MM;
  const belowFits = belowYMm + block.heightMm <= page.heightMm - LEGEND_MARGIN_MM;
  if (belowFits) {
    const maxXMm = Math.max(page.widthMm - block.widthMm - LEGEND_MARGIN_MM, LEGEND_MARGIN_MM);
    const stackedX = LEGEND_MARGIN_MM + index * (block.widthMm + LEGEND_GAP_MM);
    return { xMm: Math.min(stackedX, maxXMm), yMm: belowYMm };
  }

  return { xMm: LEGEND_MARGIN_MM, yMm: LEGEND_MARGIN_MM };
}

/**
 * Create the legend text block for a pin.
 * Use the pin number as the title. Keep the block in the free space.
 */
export function createLegendTextBlock(
  pinId: string,
  number: number,
  index: number,
  image: PlacedImage,
  page: PageSize
): TextBlock {
  const block = createTextBlock("legend", index);
  const position = legendPosition(block, image, page, index);

  return {
    ...block,
    ...position,
    pinId,
    title: String(number),
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
