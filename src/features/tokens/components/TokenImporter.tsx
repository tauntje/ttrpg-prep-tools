import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { isAcceptedImage, readImageFile, readImageSize } from "../../../shared/model/imageFile";
import type { Token } from "../../../types/token";
import { createToken } from "../model/token";

interface TokenImporterProps {
  onImport: (token: Token) => void;
}

export function TokenImporter({ onImport }: TokenImporterProps) {
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
      const size = await readImageSize(src);
      const aspect = size.width > 0 && size.height > 0 ? size.height / size.width : 1;
      onImport(createToken(src, file.name, aspect));
      setError(null);
    } catch {
      setError("The app cannot read this file.");
    }
  }

  return (
    <div className="token-importer">
      <button type="button" onClick={() => inputRef.current?.click()}>
        Import picture
      </button>
      <input
        ref={inputRef}
        className="token-importer-input"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
        onChange={handleChange}
      />
      {error !== null && (
        <p className="token-importer-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
