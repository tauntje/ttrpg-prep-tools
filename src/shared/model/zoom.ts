export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.1;
export const DEFAULT_ZOOM = 0.6;

/** Keep the zoom in the screen range. */
export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) {
    return DEFAULT_ZOOM;
  }

  const bounded = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
  return Math.round(bounded * 1000) / 1000;
}

/**
 * Convert a wheel delta to a zoom factor.
 * A wheel notch gives a smooth change.
 */
export function zoomFactorFromWheel(deltaY: number): number {
  const factor = 1 - deltaY * 0.01;
  return Math.min(Math.max(factor, 0.1), 10);
}

/** Convert the three wheel delta modes to pixels. */
export function wheelDeltaToPixels(deltaY: number, deltaMode: number): number {
  if (deltaMode === 1) {
    return deltaY * 16;
  }

  if (deltaMode === 2) {
    return deltaY * 100;
  }

  return deltaY;
}
