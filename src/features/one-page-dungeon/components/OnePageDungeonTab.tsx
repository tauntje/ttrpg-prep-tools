import { useEffect } from "react";
import { useDungeonStore } from "../../../app/store";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { pageRule } from "../../../shared/model/page";
import type { PlacedImage } from "../../../types/image";
import type { TextBlock } from "../../../types/textBlock";
import { ImageImporter } from "./ImageImporter";
import { PageCanvas } from "./PageCanvas";
import { TextBlockForm } from "./TextBlockForm";
import { TextBlockInserter } from "./TextBlockInserter";
import {
  createPin,
  nextPinNumber,
  renumberPins,
  type PinFraction,
} from "../model/pin";

export function OnePageDungeonTab() {
  const {
    orientation,
    setOrientation,
    images,
    setImages,
    pins,
    setPins,
    textBlocks,
    setTextBlocks,
    selectedId,
    setSelectedId,
  } = useDungeonStore();

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
      handleDeletePin(selectedItemId);
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

  function handleAddPin(imageId: string, fraction: PinFraction) {
    setPins((current) => [
      ...current,
      createPin(imageId, fraction, nextPinNumber(current)),
    ]);
  }

  function handleDeletePin(id: string) {
    setPins((current) => renumberPins(current.filter((pin) => pin.id !== id)));
  }

  function handleUpdateImage(id: string, patch: Partial<PlacedImage>) {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image))
    );
  }

  function handleDeleteImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
    setPins((current) => renumberPins(current.filter((pin) => pin.imageId !== id)));
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
        <PageViewport>
          <PageCanvas
            orientation={orientation}
            images={images}
            pins={pins}
            textBlocks={textBlocks}
            selectedId={selectedId}
            onSelect={handleSelect}
            onUpdateImage={handleUpdateImage}
            onUpdateTextBlock={handleUpdateTextBlock}
            onAddPin={handleAddPin}
            onDeletePin={handleDeletePin}
          />
        </PageViewport>
      </div>
    </>
  );
}
