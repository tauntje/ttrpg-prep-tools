import { useCardsStore } from "../../../app/store";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { pageRule } from "../../../shared/model/page";
import { splitIntoPages } from "../../../shared/model/sheet";
import type { Card } from "../../../types/card";
import { CardForm } from "./CardForm";
import { CardList } from "./CardList";
import { CardSheet } from "./CardSheet";
import { cardGrid, createCard } from "../model/card";

export function CardsTab() {
  const { orientation, setOrientation, cards, setCards, selectedId, setSelectedId } =
    useCardsStore();

  const selectedCard = cards.find((card) => card.id === selectedId);
  const grid = cardGrid(orientation);
  const pageCount = Math.max(splitIntoPages(grid, cards).length, 1);

  function handleInsertCard() {
    const card = createCard();
    setCards((current) => [...current, card]);
    setSelectedId(card.id);
  }

  function handleUpdateCard(id: string, patch: Partial<Card>) {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, ...patch } : card))
    );
  }

  function handleRemoveCard(id: string) {
    setCards((current) => current.filter((card) => card.id !== id));
    setSelectedId((current) => (current === id ? null : current));
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
