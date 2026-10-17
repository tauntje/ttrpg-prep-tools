import { useEffect, useState } from "react";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { DEFAULT_ORIENTATION, pageRule } from "../../../shared/model/page";
import { SaveQueue, saveNow } from "../../../storage/saveQueue";
import { tokenRepository } from "../../../storage/tokenRepository";
import type { PageOrientation } from "../../../types/page";
import type { Token } from "../../../types/token";
import { TokenForm } from "./TokenForm";
import { TokenList } from "./TokenList";
import { TokenSheet } from "./TokenSheet";
import { clampImageOffset, TOKEN_SIZES_MM, tokenPages, tokenSizeLabel } from "../model/token";

export function TokensTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveQueue] = useState(() => new SaveQueue());

  useEffect(() => {
    let active = true;

    void tokenRepository
      .list()
      .then((saved) => {
        if (active) {
          setTokens(saved);
        }
      })
      .catch((error) => {
        console.error("The app cannot load the tokens.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      void saveQueue.flushAll();
    };
  }, [saveQueue]);

  const selectedToken = tokens.find((token) => token.id === selectedId);
  const pageCount = Math.max(tokenPages(orientation, tokens).length, 1);
  const sizeLabels = TOKEN_SIZES_MM.map(tokenSizeLabel).join(", ");

  function handleImport(token: Token) {
    setTokens((current) => [...current, token]);
    setSelectedId(token.id);
    saveNow(() => tokenRepository.save(token));
  }

  function handleUpdateToken(id: string, patch: Partial<Token>) {
    const existing = tokens.find((token) => token.id === id);

    if (existing === undefined) {
      return;
    }

    const merged = { ...existing, ...patch };
    const offset = clampImageOffset(merged, merged.imageXMm, merged.imageYMm);
    const next = { ...merged, ...offset };

    setTokens((current) => current.map((token) => (token.id === id ? next : token)));
    saveQueue.add(id, () => tokenRepository.save(next));
  }

  function handleMoveImage(id: string, offset: { xMm: number; yMm: number }) {
    handleUpdateToken(id, { imageXMm: offset.xMm, imageYMm: offset.yMm });
  }

  function handleRemoveToken(id: string) {
    saveQueue.cancel(id);
    setTokens((current) => current.filter((token) => token.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    saveNow(() => tokenRepository.delete(id));
  }

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <TokenList
            tokens={tokens}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onImport={handleImport}
          />
          {selectedToken !== undefined && (
            <TokenForm
              token={selectedToken}
              onChange={(patch) => handleUpdateToken(selectedToken.id, patch)}
              onDelete={() => handleRemoveToken(selectedToken.id)}
            />
          )}
          <p className="token-summary">
            Token sizes: {sizeLabels}. {tokens.length} token
            {tokens.length === 1 ? "" : "s"} on {pageCount} page
            {pageCount === 1 ? "" : "s"}.
          </p>
        </Sidebar>
        <PageViewport>
          <TokenSheet
            orientation={orientation}
            tokens={tokens}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMoveImage={handleMoveImage}
          />
        </PageViewport>
      </div>
    </>
  );
}
