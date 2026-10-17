export interface RectSize {
  width: number;
  height: number;
}

export interface PointerPosition {
  clientX: number;
  clientY: number;
}

export interface PointMm {
  xMm: number;
  yMm: number;
}

export interface PlacementBounds {
  mmPerPx: number;
  maxXMm: number;
  maxYMm: number;
}

export interface DragSession {
  id: string;
  xMm: number;
  yMm: number;
  clientX: number;
  clientY: number;
  bounds: PlacementBounds;
}

export function clampMm(valueMm: number, maxMm: number): number {
  return Math.min(Math.max(valueMm, 0), maxMm);
}

/**
 * Get the drag scale and the position limits.
 *
 * The scale comes from the known frame width in millimetres.
 * The area rect gives the placement area. The origin is the top left corner.
 */
export function placementBounds(
  widthMm: number,
  frameRect: RectSize,
  areaRect: RectSize
): PlacementBounds | null {
  if (frameRect.width <= 0 || areaRect.width <= 0 || areaRect.height <= 0) {
    return null;
  }

  const mmPerPx = widthMm / frameRect.width;
  const areaWidthMm = areaRect.width * mmPerPx;
  const areaHeightMm = areaRect.height * mmPerPx;
  const frameHeightMm = frameRect.height * mmPerPx;

  return {
    mmPerPx,
    maxXMm: Math.max(areaWidthMm - widthMm, 0),
    maxYMm: Math.max(areaHeightMm - frameHeightMm, 0),
  };
}

export function startDrag(
  image: PointMm & { id: string },
  pointer: PointerPosition,
  bounds: PlacementBounds
): DragSession {
  return {
    id: image.id,
    xMm: image.xMm,
    yMm: image.yMm,
    clientX: pointer.clientX,
    clientY: pointer.clientY,
    bounds,
  };
}

export function dragTo(session: DragSession, pointer: PointerPosition): PointMm {
  const deltaXMm = (pointer.clientX - session.clientX) * session.bounds.mmPerPx;
  const deltaYMm = (pointer.clientY - session.clientY) * session.bounds.mmPerPx;

  return {
    xMm: clampMm(session.xMm + deltaXMm, session.bounds.maxXMm),
    yMm: clampMm(session.yMm + deltaYMm, session.bounds.maxYMm),
  };
}
