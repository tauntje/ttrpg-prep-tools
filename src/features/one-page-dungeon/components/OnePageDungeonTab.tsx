import { useEffect, useState } from "react";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { Sidebar } from "../../../shared/components/Sidebar";
import { DEFAULT_ORIENTATION, pageRule } from "../../../shared/model/page";
import type { PlacedImage } from "../../../types/image";
import type { PageOrientation } from "../../../types/page";
import type { TextBlock } from "../../../types/textBlock";
import { ImageImporter } from "./ImageImporter";
import { PageCanvas } from "./PageCanvas";
import { TextBlockForm } from "./TextBlockForm";
import { TextBlockInserter } from "./TextBlockInserter";

export function OnePageDungeonTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [images, setImages] = useState<PlacedImage[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTextBlock = textBlocks.find((textBlock) => textBlock.id === selectedId);

  useEffect(() => {
    const id: string | null = selectedId;
    if (id === null) {
      return;
    }

    const selectedItemId = id;

    function handleDeleteKey(event: KeyboardEvent) {
      if (event.key !== "Backspace" && event.key !== "Delete") {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target !== null &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA")
      ) {
        return;
      }

      event.preventDefault();
      // An id belongs to one list only.
      handleDeleteImage(selectedItemId);
      handleDeleteTextBlock(selectedItemId);
      setSelectedId(null);
    }

    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [selectedId]);

  function handleInsertTextBlock(textBlock: TextBlock) {
    setTextBlocks((current) => [...current, textBlock]);
  }

  function handlePlaceImage(image: PlacedImage) {
    setImages((current) => [...current, image]);
  }

  function handleUpdateImage(id: string, patch: Partial<PlacedImage>) {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image))
    );
  }

  function handleDeleteImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  function handleUpdateTextBlock(id: string, patch: Partial<TextBlock>) {
    setTextBlocks((current) =>
      current.map((textBlock) =>
        textBlock.id === id ? { ...textBlock, ...patch } : textBlock
      )
    );
  }

  function handleDeleteTextBlock(id: string) {
    setTextBlocks((current) => current.filter((textBlock) => textBlock.id !== id));
  }

  function handleSelect(id: string | null) {
    setSelectedId(id);
  }

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <ImageImporter imageCount={images.length} onPlace={handlePlaceImage} />
          <TextBlockInserter
            textBlockCount={textBlocks.length}
            onInsert={handleInsertTextBlock}
          />
          {selectedTextBlock !== undefined && (
            <TextBlockForm
              textBlock={selectedTextBlock}
              onChange={(patch) => handleUpdateTextBlock(selectedTextBlock.id, patch)}
            />
          )}
        </Sidebar>
        <main className="preview">
          <PageCanvas
            orientation={orientation}
            images={images}
            textBlocks={textBlocks}
            selectedId={selectedId}
            onSelect={handleSelect}
            onUpdateImage={handleUpdateImage}
            onUpdateTextBlock={handleUpdateTextBlock}
          />
        </main>
      </div>
    </>
  );
}
