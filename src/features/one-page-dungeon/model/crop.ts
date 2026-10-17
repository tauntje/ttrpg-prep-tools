import type { PlacedImage } from "../../../types/image";
import type { PointerPosition, RectSize } from "../../../shared/model/drag";
import { MIN_FRAME_MM } from "../../../shared/model/resize";

export type CropEdge = "n" | "s" | "w" | "e";

export interface CropSession {
  id: string;
  edge: CropEdge;
  clientX: number;
  clientY: number;
  mmPerPx: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  contentLeftMm: number;
  contentTopMm: number;
  contentRightMm: number;
  contentBottomMm: number;
  pageWidthMm: number;
  pageHeightMm: number;
}

export interface CropResult {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  imageXMm: number;
  imageYMm: number;
}

/**
 * Start a crop from a mid edge.
 * The image content stays in place. The frame edge moves over the content.
 */
export function startCrop(
  image: PlacedImage,
  edge: CropEdge,
  frameRect: RectSize,
  areaRect: RectSize,
  pointer: PointerPosition
): CropSession | null {
  if (frameRect.width <= 0 || areaRect.width <= 0 || areaRect.height <= 0) {
    return null;
  }

  const mmPerPx = image.widthMm / frameRect.width;
  const contentLeftMm = image.xMm + image.imageXMm;
  const contentTopMm = image.yMm + image.imageYMm;

  return {
    id: image.id,
    edge,
    clientX: pointer.clientX,
    clientY: pointer.clientY,
    mmPerPx,
    xMm: image.xMm,
    yMm: image.yMm,
    widthMm: image.widthMm,
    heightMm: image.heightMm,
    contentLeftMm,
    contentTopMm,
    contentRightMm: contentLeftMm + image.imageWidthMm,
    contentBottomMm: contentTopMm + image.imageWidthMm * image.aspectRatio,
    pageWidthMm: areaRect.width * mmPerPx,
    pageHeightMm: areaRect.height * mmPerPx,
  };
}

export function cropTo(session: CropSession, pointer: PointerPosition): CropResult {
  const deltaXMm = (pointer.clientX - session.clientX) * session.mmPerPx;
  const deltaYMm = (pointer.clientY - session.clientY) * session.mmPerPx;

  let left = session.xMm;
  let top = session.yMm;
  let right = session.xMm + session.widthMm;
  let bottom = session.yMm + session.heightMm;

  if (session.edge === "w") {
    left = clampRange(
      session.xMm + deltaXMm,
      Math.max(session.contentLeftMm, 0),
      right - MIN_FRAME_MM
    );
  } else if (session.edge === "e") {
    right = clampRange(
      right + deltaXMm,
      left + MIN_FRAME_MM,
      Math.min(session.contentRightMm, session.pageWidthMm)
    );
  } else if (session.edge === "n") {
    top = clampRange(
      session.yMm + deltaYMm,
      Math.max(session.contentTopMm, 0),
      bottom - MIN_FRAME_MM
    );
  } else {
    bottom = clampRange(
      bottom + deltaYMm,
      top + MIN_FRAME_MM,
      Math.min(session.contentBottomMm, session.pageHeightMm)
    );
  }

  return {
    xMm: left,
    yMm: top,
    widthMm: right - left,
    heightMm: bottom - top,
    imageXMm: session.contentLeftMm - left,
    imageYMm: session.contentTopMm - top,
  };
}

function clampRange(value: number, min: number, max: number): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
}
