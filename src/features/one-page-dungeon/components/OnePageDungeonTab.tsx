import { useEffect } from "react";
import { useDungeonStore } from "../../../app/store";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { pageRule, pageSizeForOrientation } from "../../../shared/model/page";
import type { PlacedImage } from "../../../types/image";
import type { Pin } from "../../../types/pin";
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
import { createLegendTextBlock, syncLegendTitles } from "../model/textBlock";

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
  }, [selectedId, images, pins, textBlocks]);

  function handleInsertTextBlock(textBlock: TextBlock) {
    setTextBlocks((current) => [...current, textBlock]);
  }

  function handlePlaceImage(image: PlacedImage) {
    setImages((current) => [...current, image]);
  }

  function handleAddPin(imageId: string, fraction: PinFraction) {
    const image = images.find((item) => item.id === imageId);
    if (image === undefined) {
      return;
    }

    const page = pageSizeForOrientation(orientation);
    const number = nextPinNumber(pins);
    const pin = createPin(imageId, fraction, number);
    const legend = createLegendTextBlock(
      pin.id,
      number,
      textBlocks.length,
      image,
      page
    );
    setPins((current) => [...current, pin]);
    setTextBlocks((current) => [...current, legend]);
  }

  function handleDeletePin(id: string) {
    const remainingPins = renumberPins(pins.filter((pin) => pin.id !== id));
    const remainingBlocks = textBlocks.filter((textBlock) => textBlock.pinId !== id);
    setPins(remainingPins);
    setTextBlocks(syncLegendTitles(remainingPins, remainingBlocks));
  }

  function handleUpdatePin(id: string, patch: Partial<Pin>) {
    setPins((current) =>
      current.map((pin) => (pin.id === id ? { ...pin, ...patch } : pin))
    );
  }

  function handleUpdateImage(id: string, patch: Partial<PlacedImage>) {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image))
    );
  }

  function handleDeleteImage(id: string) {
    const removedPinIds = new Set(
      pins.filter((pin) => pin.imageId === id).map((pin) => pin.id)
    );
    const remainingPins = renumberPins(pins.filter((pin) => pin.imageId !== id));
    const remainingBlocks = textBlocks.filter(
      (textBlock) =>
        textBlock.pinId === undefined || !removedPinIds.has(textBlock.pinId)
    );

    setImages((current) => current.filter((image) => image.id !== id));
    setPins(remainingPins);
    setTextBlocks(syncLegendTitles(remainingPins, remainingBlocks));
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
            onUpdatePin={handleUpdatePin}
          />
        </PageViewport>
      </div>
    </>
  );
}
