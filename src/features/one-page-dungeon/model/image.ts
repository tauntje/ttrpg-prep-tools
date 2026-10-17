import type { PlacedImage } from "../../../types/image";

export {
  isAcceptedImage,
  readImageFile,
  readImageSize,
} from "../../../shared/model/imageFile";
export type { ImageSize } from "../../../shared/model/imageFile";

const DEFAULT_WIDTH_MM = 80;
const OFFSET_STEP_MM = 12;
const OFFSET_LIMIT = 6;
const FALLBACK_ASPECT_RATIO = 1;

export function createPlacedImage(
  src: string,
  name: string,
  index: number,
  pixelWidth: number,
  pixelHeight: number
): PlacedImage {
  const offset = (index % OFFSET_LIMIT) * OFFSET_STEP_MM;
  const aspectRatio =
    pixelWidth > 0 && pixelHeight > 0 ? pixelHeight / pixelWidth : FALLBACK_ASPECT_RATIO;

  return {
    id: crypto.randomUUID(),
    name,
    src,
    xMm: OFFSET_STEP_MM + offset,
    yMm: OFFSET_STEP_MM + offset,
    widthMm: DEFAULT_WIDTH_MM,
    heightMm: DEFAULT_WIDTH_MM * aspectRatio,
    imageXMm: 0,
    imageYMm: 0,
    imageWidthMm: DEFAULT_WIDTH_MM,
    aspectRatio,
  };
}
