import { useEffect, useState } from "react";
import { useCardsStore } from "../../../app/store";
import { BulkActionBar } from "../../../shared/components/BulkActionBar";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { pageRule } from "../../../shared/model/page";
import { splitIntoPages } from "../../../shared/model/sheet";
import { cardRepository } from "../../../storage/cardRepository";
import type { Card } from "../../../types/card";
import { CardForm } from "./CardForm";
import { CardLibrary } from "./CardLibrary";
import { CardList } from "./CardList";
import { CardSheet } from "./CardSheet";
import { cardGrid, createCard } from "../model/card";

export function CardsTab() {
  const { orientation, setOrientation, cards, setCards, selectedIds, setSelectedIds, selectedId, setSelectedId } =
    useCardsStore();
  const [savedCards, setSavedCards] = useState<Card[]>([]);
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const [libraryOpen, setLibraryOpen] = useState(false);

  const selectedCard = cards.find((card) => card.id === selectedId);
  const grid = cardGrid(orientation);
  const pageCount = Math.max(splitIntoPages(grid, cards).length, 1);

  useEffect(() => {
    if (selectedIds.length === 0) {
      return;
    }

    function handleDeleteKey(event: KeyboardEvent) {
      if (event.key !== "Backspace" && event.key !== "Delete") {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target !== null &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.tagName === "BUTTON")
      ) {
        return;
      }

      event.preventDefault();
      handleDeleteSelected();
    }

    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [selectedIds, cards]);

  function markUnsaved(id: string) {
    setUnsavedIds((current) => new Set(current).add(id));
  }

  async function handleToggleLibrary() {
    if (libraryOpen) {
      setLibraryOpen(false);
      return;
    }

    try {
      const saved = await cardRepository.list();
      setSavedCards(saved);
      setLibraryOpen(true);
    } catch (error) {
      console.error("The app cannot load the card library.", error);
    }
  }

  function handleInsertCard() {
    const card = createCard();
    setCards((current) => [...current, card]);
    setSelectedId(card.id);
    markUnsaved(card.id);
  }

  function handleUpdateCard(id: string, patch: Partial<Card>) {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, ...patch } : card))
    );
    markUnsaved(id);
  }

  function handleSaveCard(id: string) {
    const card = cards.find((item) => item.id === id);

    if (card === undefined) {
      return;
    }

    void cardRepository
      .save(card)
      .then(() => {
        setUnsavedIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      })
      .catch((error) => {
        console.error("The app cannot save the card.", error);
      });
  }

  function handleRemoveCard(id: string) {
    setCards((current) => current.filter((card) => card.id !== id));
    setUnsavedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const removed = new Set(selectedIds);
    setCards((current) => current.filter((card) => !removed.has(card.id)));
    setUnsavedIds((current) => {
      const next = new Set(current);
      for (const id of selectedIds) {
        next.delete(id);
      }
      return next;
    });
    setSelectedIds([]);
  }

  async function handleSaveSelected() {
    const selectedCards = cards.filter((card) => selectedIds.includes(card.id));

    try {
      for (const card of selectedCards) {
        await cardRepository.save(card);
      }

      setUnsavedIds((current) => {
        const next = new Set(current);
        for (const card of selectedCards) {
          next.delete(card.id);
        }
        return next;
      });
    } catch (error) {
      console.error("The app cannot save the cards.", error);
    }
  }

  function handleLoadCard(card: Card) {
    const copy: Card = { ...card, id: crypto.randomUUID() };
    setCards((current) => [...current, copy]);
    setSelectedId(copy.id);
    markUnsaved(copy.id);
  }

  function handleDeleteSavedCard(id: string) {
    void cardRepository
      .delete(id)
      .then(() => {
        setSavedCards((current) => current.filter((card) => card.id !== id));
      })
      .catch((error) => {
        console.error("The app cannot delete the card.", error);
      });
  }

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <CardList
            cards={cards}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onInsert={handleInsertCard}
            onToggleLibrary={handleToggleLibrary}
          />
          {libraryOpen ? (
            <CardLibrary
              cards={savedCards}
              onLoad={handleLoadCard}
              onDelete={handleDeleteSavedCard}
              onClose={() => setLibraryOpen(false)}
            />
          ) : (
            selectedCard !== undefined && (
              <CardForm
                isUnsaved={unsavedIds.has(selectedCard.id)}
                onSave={() => handleSaveCard(selectedCard.id)}
                onDelete={() => handleRemoveCard(selectedCard.id)}
              />
            )
          )}
          <p className="card-summary">
            Card size: 60 mm by 80 mm. {grid.perPage} cards on each page. {pageCount} page
            {pageCount === 1 ? "" : "s"}.
          </p>
        </Sidebar>
        <PageViewport>
          <CardSheet
            orientation={orientation}
            cards={cards}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onUpdateCard={handleUpdateCard}
          />
        </PageViewport>
        <BulkActionBar count={selectedIds.length > 1 ? selectedIds.length : 0} onClear={() => setSelectedIds([])}>
          <button type="button" onClick={() => void handleSaveSelected()}>
            Save to library
          </button>
          <button type="button" onClick={handleDeleteSelected}>
            Delete
          </button>
        </BulkActionBar>
      </div>
    </>
  );
}
