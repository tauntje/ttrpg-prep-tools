import { useEffect } from "react";
import { useDungeonStore } from "../../../app/store";
import { BulkActionBar } from "../../../shared/components/BulkActionBar";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import { pageRule } from "../../../shared/model/page";
import type { PlacedImage } from "../../../types/image";
import type { Pin } from "../../../types/pin";
import type { TextBlock } from "../../../types/textBlock";
import { ImageImporter } from "./ImageImporter";
import { PageCanvas } from "./PageCanvas";
import { TextBlockInserter } from "./TextBlockInserter";
import {
  createPin,
  nextPinNumber,
  renumberPins,
  type PinFraction,
} from "../model/pin";
import { createTextBlock, syncLegendTitles } from "../model/textBlock";

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
    selectedIds,
    setSelectedIds,
  } = useDungeonStore();

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
  }, [selectedIds, images, pins, textBlocks]);

  function handleInsertTextBlock(textBlock: TextBlock) {
    setTextBlocks((current) => [...current, textBlock]);
  }

  function handlePlaceImage(image: PlacedImage) {
    setImages((current) => [...current, image]);
  }

  function handleAddPin(imageId: string, fraction: PinFraction) {
    const number = nextPinNumber(pins);
    const pin = createPin(imageId, fraction, number);
    const legend = {
      ...createTextBlock("legend"),
      pinId: pin.id,
      title: String(number),
    };
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

  function handleUpdateTextBlock(id: string, patch: Partial<TextBlock>) {
    setTextBlocks((current) =>
      current.map((textBlock) =>
        textBlock.id === id ? { ...textBlock, ...patch } : textBlock
      )
    );
  }

  /**
   * Delete the selected images, pins and text blocks.
   * A removed image also removes its pins and their legend blocks.
   */
  function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const removed = new Set(selectedIds);
    const removedImageIds = new Set(
      images.filter((image) => removed.has(image.id)).map((image) => image.id)
    );
    const removedPinIds = new Set(
      pins
        .filter((pin) => removed.has(pin.id) || removedImageIds.has(pin.imageId))
        .map((pin) => pin.id)
    );
    const remainingPins = renumberPins(
      pins.filter((pin) => !removedPinIds.has(pin.id))
    );
    const remainingBlocks = textBlocks.filter(
      (textBlock) =>
        !removed.has(textBlock.id) &&
        (textBlock.pinId === undefined || !removedPinIds.has(textBlock.pinId))
    );

    setImages((current) => current.filter((image) => !removedImageIds.has(image.id)));
    setPins(remainingPins);
    setTextBlocks(syncLegendTitles(remainingPins, remainingBlocks));
    setSelectedIds([]);
  }

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <ImageImporter imageCount={images.length} onPlace={handlePlaceImage} />
          <TextBlockInserter onInsert={handleInsertTextBlock} />
        </Sidebar>
        <PageViewport>
          <PageCanvas
            orientation={orientation}
            images={images}
            pins={pins}
            textBlocks={textBlocks}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onUpdateImage={handleUpdateImage}
            onUpdateTextBlock={handleUpdateTextBlock}
            onAddPin={handleAddPin}
            onDeletePin={handleDeletePin}
            onUpdatePin={handleUpdatePin}
          />
        </PageViewport>
        <BulkActionBar
          count={selectedIds.length > 1 ? selectedIds.length : 0}
          onClear={() => setSelectedIds([])}
        >
          <button type="button" onClick={handleDeleteSelected}>
            Delete
          </button>
        </BulkActionBar>
      </div>
    </>
  );
}
