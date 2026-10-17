import type { PlacedImage } from "../../types/image";
import type { PointerPosition, RectSize } from "./drag";

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

export const MIN_FRAME_MM = 10;

export interface ResizeSession {
  id: string;
  corner: ResizeCorner;
  clientX: number;
  clientY: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  imageXMm: number;
  imageYMm: number;
  imageWidthMm: number;
  aspect: number;
  mmPerPx: number;
  areaWidthMm: number;
  areaHeightMm: number;
}

export interface ResizeResult {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  imageXMm: number;
  imageYMm: number;
  imageWidthMm: number;
}

/**
 * Start a scale from a corner. The opposite corner stays in place.
 * The frame and the image scale together. The crop stays in proportion.
 */
export function startResize(
  image: PlacedImage,
  corner: ResizeCorner,
  frameRect: RectSize,
  areaRect: RectSize,
  pointer: PointerPosition
): ResizeSession | null {
  if (frameRect.width <= 0 || frameRect.height <= 0) {
    return null;
  }

  if (areaRect.width <= 0 || areaRect.height <= 0) {
    return null;
  }

  const mmPerPx = image.widthMm / frameRect.width;
  const aspect = image.heightMm / image.widthMm;

  return {
    id: image.id,
    corner,
    clientX: pointer.clientX,
    clientY: pointer.clientY,
    xMm: image.xMm,
    yMm: image.yMm,
    widthMm: image.widthMm,
    heightMm: image.heightMm,
    imageXMm: image.imageXMm,
    imageYMm: image.imageYMm,
    imageWidthMm: image.imageWidthMm,
    aspect,
    mmPerPx,
    areaWidthMm: areaRect.width * mmPerPx,
    areaHeightMm: areaRect.height * mmPerPx,
  };
}

export function resizeTo(session: ResizeSession, pointer: PointerPosition): ResizeResult {
  const deltaXMm = (pointer.clientX - session.clientX) * session.mmPerPx;
  const deltaYMm = (pointer.clientY - session.clientY) * session.mmPerPx;

  const growsRight = session.corner === "ne" || session.corner === "se";
  const growsDown = session.corner === "se" || session.corner === "sw";

  const anchorXMm = growsRight ? session.xMm : session.xMm + session.widthMm;
  const anchorYMm = growsDown ? session.yMm : session.yMm + session.heightMm;

  const widthFromX = session.widthMm + (growsRight ? deltaXMm : -deltaXMm);
  const heightFromY = session.heightMm + (growsDown ? deltaYMm : -deltaYMm);
  const widthFromY = heightFromY / session.aspect;

  const moveX = Math.abs(widthFromX - session.widthMm);
  const moveY = Math.abs(widthFromY - session.widthMm);
  const wantedWidthMm = moveX >= moveY ? widthFromX : widthFromY;

  const limitXMm = growsRight ? session.areaWidthMm - anchorXMm : anchorXMm;
  const limitYMm = growsDown
    ? (session.areaHeightMm - anchorYMm) / session.aspect
    : anchorYMm / session.aspect;

  const maxWidthMm = Math.max(Math.min(limitXMm, limitYMm), 0);
  const minWidthMm = Math.min(MIN_FRAME_MM, maxWidthMm);
  const widthMm = Math.min(Math.max(wantedWidthMm, minWidthMm), maxWidthMm);
  const scale = session.widthMm > 0 ? widthMm / session.widthMm : 1;

  return {
    xMm: growsRight ? anchorXMm : anchorXMm - widthMm,
    yMm: growsDown ? anchorYMm : anchorYMm - session.heightMm * scale,
    widthMm,
    heightMm: session.heightMm * scale,
    imageXMm: session.imageXMm * scale,
    imageYMm: session.imageYMm * scale,
    imageWidthMm: session.imageWidthMm * scale,
  };
}
