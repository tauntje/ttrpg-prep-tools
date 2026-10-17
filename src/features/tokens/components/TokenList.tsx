import type { Token } from "../../../types/token";
import { tokenTitle } from "../model/token";
import { TokenImporter } from "./TokenImporter";

interface TokenListProps {
  tokens: Token[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onImport: (token: Token) => void;
  onToggleLibrary: () => void;
}

/**
 * Show the tokens that are on the sheet. The user selects a token to edit it.
 */
export function TokenList({
  tokens,
  selectedId,
  onSelect,
  onImport,
  onToggleLibrary,
}: TokenListProps) {
  return (
    <div className="token-list">
      <div className="token-list-head">
        <h3>Tokens</h3>
        <div className="token-list-actions">
          <TokenImporter onImport={onImport} />
          <button type="button" onClick={onToggleLibrary}>
            Library
          </button>
        </div>
      </div>
      {tokens.length === 0 ? (
        <p className="token-list-empty">No tokens. Select Import picture.</p>
      ) : (
        <ol className="token-list-items">
          {tokens.map((token) => (
            <li key={token.id}>
              <button
                type="button"
                className={token.id === selectedId ? "is-active" : undefined}
                onClick={() => onSelect(token.id)}
              >
                <span
                  className="token-list-thumb"
                  style={{ borderColor: token.ringColour }}
                  aria-hidden="true"
                />
                {tokenTitle(token)}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
