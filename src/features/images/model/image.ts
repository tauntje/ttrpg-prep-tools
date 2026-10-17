import type { PlacedImage } from "../../../types/image";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

const DEFAULT_WIDTH_MM = 80;
const OFFSET_STEP_MM = 12;
const OFFSET_LIMIT = 6;
const FALLBACK_ASPECT_RATIO = 1;

export interface ImageSize {
  width: number;
  height: number;
}

export function isAcceptedImage(file: File): boolean {
  if (file.type !== "") {
    return ACCEPTED_TYPES.includes(file.type);
  }
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Cannot read the image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Read the natural size of an image.
 * The crop model needs the aspect ratio before the image shows.
 */
export function readImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Cannot load the image."));
    image.src = src;
  });
}

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
