import { TextControl } from "../../../shared/components/TextControl";
import type { Token } from "../../../types/token";
import {
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SCALE,
  TOKEN_SIZES_MM,
  tokenSizeLabel,
} from "../model/token";

interface TokenFormProps {
  token: Token;
  onChange: (patch: Partial<Token>) => void;
  onDelete: () => void;
}

/**
 * Edit the selected token. Each change shows on the sheet at once.
 */
export function TokenForm({ token, onChange, onDelete }: TokenFormProps) {
  return (
    <div className="token-form">
      <h3>Token</h3>
      <label className="token-field">
        Name
        <TextControl value={token.name} onChange={(name) => onChange({ name })} />
      </label>
      <fieldset className="token-field token-size-field">
        <legend>Size</legend>
        <div className="token-size-options">
          {TOKEN_SIZES_MM.map((sizeMm) => (
            <label key={sizeMm} className="token-size-option">
              <input
                type="radio"
                name={`token-size-${token.id}`}
                checked={token.sizeMm === sizeMm}
                onChange={() => onChange({ sizeMm })}
              />
              {tokenSizeLabel(sizeMm)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="token-field">
        Ring colour
        <input
          type="color"
          value={token.ringColour}
          onChange={(event) => onChange({ ringColour: event.target.value })}
        />
      </label>
      <label className="token-field">
        Picture scale
        <input
          type="range"
          min={MIN_IMAGE_SCALE}
          max={MAX_IMAGE_SCALE}
          step={0.05}
          value={token.imageScale}
          onChange={(event) => onChange({ imageScale: Number(event.target.value) })}
        />
      </label>
      <button type="button" className="token-delete" onClick={onDelete}>
        Remove token
      </button>
    </div>
  );
}
