import type { PageOrientation } from "../../../types/page";

interface OrientationToggleProps {
  orientation: PageOrientation;
  onChange: (orientation: PageOrientation) => void;
}

export function OrientationToggle({ orientation, onChange }: OrientationToggleProps) {
  return (
    <div className="orientation-toggle" role="group" aria-label="Page orientation">
      <button
        type="button"
        aria-pressed={orientation === "portrait"}
        onClick={() => onChange("portrait")}
      >
        Portrait
      </button>
      <button
        type="button"
        aria-pressed={orientation === "landscape"}
        onClick={() => onChange("landscape")}
      >
        Landscape
      </button>
    </div>
  );
}
