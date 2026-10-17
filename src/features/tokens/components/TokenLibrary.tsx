import type { Token } from "../../../types/token";
import { tokenTitle } from "../model/token";
import { TokenView } from "./TokenView";

interface TokenLibraryProps {
  tokens: Token[];
  onLoad: (token: Token) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/**
 * Show the saved tokens. Each row shows a preview and a name.
 * The Load action copies the token to the sheet. The Delete action removes the row.
 */
export function TokenLibrary({ tokens, onLoad, onDelete, onClose }: TokenLibraryProps) {
  return (
    <div className="token-library">
      <div className="token-list-head">
        <h3>Token library</h3>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {tokens.length === 0 ? (
        <p className="token-list-empty">No saved tokens.</p>
      ) : (
        <ul className="token-library-items">
          {tokens.map((token) => (
            <li key={token.id} className="token-library-item">
              <div className="token-preview" style={{ zoom: 0.5 }}>
                <TokenView token={token} />
              </div>
              <div className="token-library-meta">
                <span className="token-library-name">{tokenTitle(token)}</span>
                <div className="token-library-actions">
                  <button type="button" onClick={() => onLoad(token)}>
                    Load
                  </button>
                  <button
                    type="button"
                    className="token-delete"
                    onClick={() => onDelete(token.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
