import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "../model/zoom";

interface ZoomBarProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

/** The screen bar below the page. The bar changes the page zoom. */
export function ZoomBar({ zoom, onChange }: ZoomBarProps) {
  return (
    <div className="zoom-bar screen-only" role="group" aria-label="Page zoom">
      <button
        type="button"
        className="zoom-button"
        aria-label="Zoom out"
        onClick={() => onChange(zoom - ZOOM_STEP)}
      >
        −
      </button>
      <input
        className="zoom-slider"
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={ZOOM_STEP}
        value={zoom}
        aria-label="Zoom level"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <button
        type="button"
        className="zoom-button"
        aria-label="Zoom in"
        onClick={() => onChange(zoom + ZOOM_STEP)}
      >
        +
      </button>
      <span className="zoom-value">{Math.round(zoom * 100)}%</span>
    </div>
  );
}
