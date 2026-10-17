import { useEffect, useState } from "react";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { DEFAULT_ORIENTATION, pageRule } from "../../../shared/model/page";
import { splitIntoPages } from "../../../shared/model/sheet";
import { cardRepository } from "../../../storage/cardRepository";
import { SaveQueue, saveNow } from "../../../storage/saveQueue";
import type { Card } from "../../../types/card";
import type { PageOrientation } from "../../../types/page";
import { CardForm } from "./CardForm";
import { CardList } from "./CardList";
import { CardSheet } from "./CardSheet";
import { cardGrid, createCard } from "../model/card";

export function CardsTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveQueue] = useState(() => new SaveQueue());

  useEffect(() => {
    let active = true;

    void cardRepository
      .list()
      .then((saved) => {
        if (active) {
          setCards(saved);
        }
      })
      .catch((error) => {
        console.error("The app cannot load the cards.", error);
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

  const selectedCard = cards.find((card) => card.id === selectedId);
  const grid = cardGrid(orientation);
  const pageCount = Math.max(splitIntoPages(grid, cards).length, 1);

  function handleInsertCard() {
    const card = createCard();
    setCards((current) => [...current, card]);
    setSelectedId(card.id);
    saveNow(() => cardRepository.save(card));
  }

  function handleUpdateCard(id: string, patch: Partial<Card>) {
    const existing = cards.find((card) => card.id === id);

    if (existing === undefined) {
      return;
    }

    const next = { ...existing, ...patch };
    setCards((current) => current.map((card) => (card.id === id ? next : card)));
    saveQueue.add(id, () => cardRepository.save(next));
  }

  function handleRemoveCard(id: string) {
    saveQueue.cancel(id);
    setCards((current) => current.filter((card) => card.id !== id));
    setSelectedId((current) => (current === id ? null : current));
    saveNow(() => cardRepository.delete(id));
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
          />
          {selectedCard !== undefined && (
            <CardForm
              card={selectedCard}
              onChange={(patch) => handleUpdateCard(selectedCard.id, patch)}
              onDelete={() => handleRemoveCard(selectedCard.id)}
            />
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
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </PageViewport>
      </div>
    </>
  );
}
