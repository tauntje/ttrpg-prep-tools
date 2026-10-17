import { useState } from "react";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { DEFAULT_ORIENTATION, pageRule } from "../../../shared/model/page";
import { tokenRepository } from "../../../storage/tokenRepository";
import type { PageOrientation } from "../../../types/page";
import type { Token } from "../../../types/token";
import { TokenForm } from "./TokenForm";
import { TokenLibrary } from "./TokenLibrary";
import { TokenList } from "./TokenList";
import { TokenSheet } from "./TokenSheet";
import { clampImageOffset, TOKEN_SIZES_MM, tokenPages, tokenSizeLabel } from "../model/token";

export function TokensTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [savedTokens, setSavedTokens] = useState<Token[]>([]);
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedToken = tokens.find((token) => token.id === selectedId);
  const pageCount = Math.max(tokenPages(orientation, tokens).length, 1);
  const sizeLabels = TOKEN_SIZES_MM.map(tokenSizeLabel).join(", ");

  function markUnsaved(id: string) {
    setUnsavedIds((current) => new Set(current).add(id));
  }

  async function handleToggleLibrary() {
    if (libraryOpen) {
      setLibraryOpen(false);
      return;
    }

    try {
      const saved = await tokenRepository.list();
      setSavedTokens(saved);
      setLibraryOpen(true);
    } catch (error) {
      console.error("The app cannot load the token library.", error);
    }
  }

  function handleImport(token: Token) {
    setTokens((current) => [...current, token]);
    setSelectedId(token.id);
    markUnsaved(token.id);
  }

  function handleUpdateToken(id: string, patch: Partial<Token>) {
    setTokens((current) =>
      current.map((token) => {
        if (token.id !== id) {
          return token;
        }

        const merged = { ...token, ...patch };
        const offset = clampImageOffset(merged, merged.imageXMm, merged.imageYMm);
        return { ...merged, ...offset };
      })
    );
    markUnsaved(id);
  }

  function handleMoveImage(id: string, offset: { xMm: number; yMm: number }) {
    handleUpdateToken(id, { imageXMm: offset.xMm, imageYMm: offset.yMm });
  }

  function handleSaveToken(id: string) {
    const token = tokens.find((item) => item.id === id);

    if (token === undefined) {
      return;
    }

    void tokenRepository
      .save(token)
      .then(() => {
        setUnsavedIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      })
      .catch((error) => {
        console.error("The app cannot save the token.", error);
      });
  }

  function handleRemoveToken(id: string) {
    setTokens((current) => current.filter((token) => token.id !== id));
    setUnsavedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setSelectedId((current) => (current === id ? null : current));
  }

  function handleLoadToken(token: Token) {
    const copy: Token = { ...token, id: crypto.randomUUID() };
    setTokens((current) => [...current, copy]);
    setSelectedId(copy.id);
    markUnsaved(copy.id);
  }

  function handleDeleteSavedToken(id: string) {
    void tokenRepository
      .delete(id)
      .then(() => {
        setSavedTokens((current) => current.filter((token) => token.id !== id));
      })
      .catch((error) => {
        console.error("The app cannot delete the token.", error);
      });
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
            onToggleLibrary={handleToggleLibrary}
          />
          {libraryOpen ? (
            <TokenLibrary
              tokens={savedTokens}
              onLoad={handleLoadToken}
              onDelete={handleDeleteSavedToken}
              onClose={() => setLibraryOpen(false)}
            />
          ) : (
            selectedToken !== undefined && (
              <TokenForm
                token={selectedToken}
                isUnsaved={unsavedIds.has(selectedToken.id)}
                onChange={(patch) => handleUpdateToken(selectedToken.id, patch)}
                onSave={() => handleSaveToken(selectedToken.id)}
                onDelete={() => handleRemoveToken(selectedToken.id)}
              />
            )
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
