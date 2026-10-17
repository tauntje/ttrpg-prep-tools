import type { PlacedImage } from "../../../types/image";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

const DEFAULT_WIDTH_MM = 80;
const OFFSET_STEP_MM = 12;
const OFFSET_LIMIT = 6;

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

export function createPlacedImage(src: string, name: string, index: number): PlacedImage {
  const offset = (index % OFFSET_LIMIT) * OFFSET_STEP_MM;

  return {
    id: crypto.randomUUID(),
    name,
    src,
    xMm: OFFSET_STEP_MM + offset,
    yMm: OFFSET_STEP_MM + offset,
    widthMm: DEFAULT_WIDTH_MM,
  };
}
