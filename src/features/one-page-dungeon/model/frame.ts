import type { PointerPosition, RectSize } from "../../../shared/model/drag";
import { MIN_FRAME_MM, type ResizeCorner } from "../../../shared/model/resize";

export interface FrameBox {
  id: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface FrameResizeSession {
  id: string;
  corner: ResizeCorner;
  clientX: number;
  clientY: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  mmPerPx: number;
  areaWidthMm: number;
  areaHeightMm: number;
}

export interface FrameResizeResult {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

/**
 * Start a free scale from a corner. The opposite corner stays in place.
 * The width and the height change on their own.
 */
export function startFrameResize(
  frame: FrameBox,
  corner: ResizeCorner,
  frameRect: RectSize,
  areaRect: RectSize,
  pointer: PointerPosition
): FrameResizeSession | null {
  if (frameRect.width <= 0 || frameRect.height <= 0) {
    return null;
  }

  if (areaRect.width <= 0 || areaRect.height <= 0) {
    return null;
  }

  const mmPerPx = frame.widthMm / frameRect.width;

  return {
    id: frame.id,
    corner,
    clientX: pointer.clientX,
    clientY: pointer.clientY,
    xMm: frame.xMm,
    yMm: frame.yMm,
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    mmPerPx,
    areaWidthMm: areaRect.width * mmPerPx,
    areaHeightMm: areaRect.height * mmPerPx,
  };
}

export function frameResizeTo(
  session: FrameResizeSession,
  pointer: PointerPosition
): FrameResizeResult {
  const deltaXMm = (pointer.clientX - session.clientX) * session.mmPerPx;
  const deltaYMm = (pointer.clientY - session.clientY) * session.mmPerPx;

  const growsRight = session.corner === "ne" || session.corner === "se";
  const growsDown = session.corner === "se" || session.corner === "sw";

  const anchorXMm = growsRight ? session.xMm : session.xMm + session.widthMm;
  const anchorYMm = growsDown ? session.yMm : session.yMm + session.heightMm;

  const maxWidthMm = growsRight ? session.areaWidthMm - anchorXMm : anchorXMm;
  const maxHeightMm = growsDown ? session.areaHeightMm - anchorYMm : anchorYMm;

  const widthMm = clampSize(session.widthMm + (growsRight ? deltaXMm : -deltaXMm), maxWidthMm);
  const heightMm = clampSize(session.heightMm + (growsDown ? deltaYMm : -deltaYMm), maxHeightMm);

  return {
    xMm: growsRight ? anchorXMm : anchorXMm - widthMm,
    yMm: growsDown ? anchorYMm : anchorYMm - heightMm,
    widthMm,
    heightMm,
  };
}

function clampSize(value: number, max: number): number {
  const high = Math.max(max, 0);
  return Math.min(Math.max(value, Math.min(MIN_FRAME_MM, high)), high);
}
