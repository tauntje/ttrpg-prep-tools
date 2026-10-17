import type { PlacedImage } from "../../../types/image";
import type { Pin } from "../../../types/pin";

export interface PinFraction {
  xFraction: number;
  yFraction: number;
}

export interface PinPositionMm {
  xMm: number;
  yMm: number;
}

/**
 * Make a pin at one point on the image content.
 * The fraction keeps the pin on the same map point after a move or a scale.
 */
export function createPin(imageId: string, fraction: PinFraction, number: number): Pin {
  return {
    id: crypto.randomUUID(),
    imageId,
    number,
    xFraction: clampFraction(fraction.xFraction),
    yFraction: clampFraction(fraction.yFraction),
  };
}

/**
 * Get the number for the next pin.
 */
export function nextPinNumber(pins: Pin[]): number {
  return pins.reduce((highest, pin) => Math.max(highest, pin.number), 0) + 1;
}

/**
 * Sort the pins by number and give them a sequence from one.
 * The sequence has no gap.
 */
export function renumberPins(pins: Pin[]): Pin[] {
  return [...pins]
    .sort((first, second) => first.number - second.number)
    .map((pin, index) => ({ ...pin, number: index + 1 }));
}

/**
 * Get the pin position on the page in millimetres.
 */
export function pinPositionMm(pin: Pin, image: PlacedImage): PinPositionMm {
  return {
    xMm: image.xMm + image.imageXMm + pin.xFraction * image.imageWidthMm,
    yMm:
      image.yMm +
      image.imageYMm +
      pin.yFraction * image.imageWidthMm * image.aspectRatio,
  };
}

/**
 * Get the image content point as a fraction of the content size.
 * The offset is the pointer offset in the image frame, in millimetres.
 */
export function pinFractionAt(
  image: PlacedImage,
  offsetXMm: number,
  offsetYMm: number
): PinFraction {
  const contentHeightMm = image.imageWidthMm * image.aspectRatio;
  if (image.imageWidthMm <= 0 || contentHeightMm <= 0) {
    return { xFraction: 0, yFraction: 0 };
  }

  return {
    xFraction: clampFraction((offsetXMm - image.imageXMm) / image.imageWidthMm),
    yFraction: clampFraction((offsetYMm - image.imageYMm) / contentHeightMm),
  };
}

function clampFraction(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
