const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

export interface ImageSize {
  width: number;
  height: number;
}

/**
 * Accept a PNG, JPEG, or SVG file. Use the type first and the name second.
 */
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
 * The caller needs the aspect ratio before the image shows.
 */
export function readImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Cannot load the image."));
    image.src = src;
  });
}
