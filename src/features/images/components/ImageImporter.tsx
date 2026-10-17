import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { PlacedImage } from "../../../types/image";
import { createPlacedImage, isAcceptedImage, readImageFile } from "../model/image";

interface ImageImporterProps {
  imageCount: number;
  onPlace: (image: PlacedImage) => void;
}

export function ImageImporter({ imageCount, onPlace }: ImageImporterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file === undefined) {
      return;
    }

    if (!isAcceptedImage(file)) {
      setError("Use a PNG, JPEG, or SVG file.");
      return;
    }

    try {
      const src = await readImageFile(file);
      onPlace(createPlacedImage(src, file.name, imageCount));
      setError(null);
    } catch {
      setError("The app cannot read this file.");
    }
  }

  return (
    <div className="image-importer">
      <h3>Image</h3>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Import image
      </button>
      <input
        ref={inputRef}
        className="image-importer-input"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
        onChange={handleChange}
      />
      {error !== null && (
        <p className="image-importer-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
