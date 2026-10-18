import { useRef } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import Markdown from "react-markdown";
import type { PlacedImage } from "../../../types/image";
import type { PageOrientation } from "../../../types/page";
import type { Pin } from "../../../types/pin";
import type { TextBlock } from "../../../types/textBlock";
import {
  clampMm,
  dragTo,
  placementBounds,
  startDrag,
  type DragSession,
  type PointMm,
  type PointerPosition,
} from "../../../shared/model/drag";
import { cropTo, startCrop, type CropEdge, type CropSession } from "../model/crop";
import {
  frameResizeTo,
  startFrameResize,
  type FrameResizeSession,
} from "../model/frame";
import {
  resizeTo,
  startResize,
  type ResizeCorner,
  type ResizeSession,
} from "../../../shared/model/resize";
import { pageSizeForOrientation } from "../../../shared/model/page";
import { moveFraction, pinFractionAt, pinPositionMm, type PinFraction } from "../model/pin";
import { TEXT_BLOCK_THEMES } from "../model/textBlockTheme";

interface PageCanvasProps {
  orientation: PageOrientation;
  images: PlacedImage[];
  pins: Pin[];
  textBlocks: TextBlock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateImage: (id: string, patch: Partial<PlacedImage>) => void;
  onUpdateTextBlock: (id: string, patch: Partial<TextBlock>) => void;
  onAddPin: (imageId: string, fraction: PinFraction) => void;
  onDeletePin: (id: string) => void;
  onUpdatePin: (id: string, patch: Partial<Pin>) => void;
}

const NUDGE_STEP_MM = 1;
const NUDGE_STEP_FAST_MM = 10;
const DRAG_THRESHOLD_PX = 3;
const CORNER_HANDLES: ResizeCorner[] = ["nw", "ne", "sw", "se"];
const EDGE_HANDLES: CropEdge[] = ["n", "e", "s", "w"];

interface MoveGesture {
  session: DragSession;
  pointerId: number;
  element: HTMLElement;
  moved: boolean;
  onMove: (id: string, position: PointMm) => void;
}

interface PinMoveGesture {
  id: string;
  image: PlacedImage;
  xFraction: number;
  yFraction: number;
  clientX: number;
  clientY: number;
  mmPerPx: number;
  pointerId: number;
  element: HTMLElement;
  moved: boolean;
}

export function PageCanvas({
  orientation,
  images,
  pins,
  textBlocks,
  selectedId,
  onSelect,
  onUpdateImage,
  onUpdateTextBlock,
  onAddPin,
  onDeletePin,
  onUpdatePin,
}: PageCanvasProps) {
  const page = pageSizeForOrientation(orientation);
  const pageRef = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const pointerScaleRef = useRef(1);
  const moveRef = useRef<MoveGesture | null>(null);
  const pinMoveRef = useRef<PinMoveGesture | null>(null);
  const resizeRef = useRef<ResizeSession | null>(null);
  const cropRef = useRef<CropSession | null>(null);
  const textResizeRef = useRef<FrameResizeSession | null>(null);

  function pageZoom(): number {
    const pageElement = pageRef.current;
    if (pageElement === null) {
      return 1;
    }

    const style = getComputedStyle(pageElement);
    const zoom = Number.parseFloat(style.zoom);
    if (Number.isFinite(zoom) && zoom > 0) {
      return zoom;
    }

    const variable = Number.parseFloat(style.getPropertyValue("--page-zoom"));
    return Number.isFinite(variable) && variable > 0 ? variable : 1;
  }

  /**
   * Get the scale from the pointer pixels to the rect pixels.
   *
   * WebKit gives layout pixels in a rect and visual pixels in a pointer event.
   * Chromium gives visual pixels in both. The CSS zoom makes the difference.
   */
  function pointerScale(): number {
    const pageElement = pageRef.current;
    if (pageElement === null) {
      return 1;
    }

    const zoom = pageZoom();
    if (zoom === 1) {
      return 1;
    }

    const rectWidth = pageElement.getBoundingClientRect().width;
    const layoutWidth = pageElement.offsetWidth;
    if (rectWidth <= 0 || layoutWidth <= 0) {
      return 1;
    }

    const rectHasZoom =
      Math.abs(rectWidth - layoutWidth * zoom) <= Math.abs(rectWidth - layoutWidth);
    return rectHasZoom ? 1 : 1 / zoom;
  }

  function rememberPointerScale() {
    pointerScaleRef.current = pointerScale();
  }

  /** Put the pointer in the same pixel space as the element rect. */
  function scaledPointer(event: PointerPosition): PointerPosition {
    const scale = pointerScaleRef.current;
    if (scale === 1) {
      return { clientX: event.clientX, clientY: event.clientY };
    }

    return { clientX: event.clientX * scale, clientY: event.clientY * scale };
  }

  function boundsFor(widthMm: number, frameElement: HTMLElement) {
    const areaElement = areaRef.current;
    if (areaElement === null) {
      return null;
    }

    return placementBounds(
      widthMm,
      frameElement.getBoundingClientRect(),
      areaElement.getBoundingClientRect()
    );
  }

  function handleBackgroundPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onSelect(null);
    }
  }

  function handleFramePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    image: PlacedImage
  ) {
    if (event.button !== 0) {
      return;
    }

    const bounds = boundsFor(image.widthMm, event.currentTarget);
    if (bounds === null) {
      return;
    }

    rememberPointerScale();
    moveRef.current = {
      session: startDrag(image, scaledPointer(event), bounds),
      pointerId: event.pointerId,
      element: event.currentTarget,
      moved: false,
      onMove: (id, position) => onUpdateImage(id, position),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleFramePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = moveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    const pointer = scaledPointer(event);

    if (!gesture.moved) {
      const deltaX = pointer.clientX - gesture.session.clientX;
      const deltaY = pointer.clientY - gesture.session.clientY;
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      gesture.moved = true;
    }

    const position = dragTo(gesture.session, pointer);
    gesture.onMove(gesture.session.id, position);
  }

  function handleFramePointerUp(event: ReactPointerEvent<HTMLDivElement>, image: PlacedImage) {
    const gesture = moveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    moveRef.current = null;
    if (gesture.element.hasPointerCapture(event.pointerId)) {
      gesture.element.releasePointerCapture(event.pointerId);
    }

    if (!gesture.moved) {
      onSelect(image.id);
    }
  }

  function handleFrameContextMenu(
    event: ReactMouseEvent<HTMLDivElement>,
    image: PlacedImage
  ) {
    event.preventDefault();

    const frameRect = event.currentTarget.getBoundingClientRect();
    if (frameRect.width <= 0) {
      return;
    }

    const scale = pointerScale();
    const mmPerPx = image.widthMm / frameRect.width;
    const offsetXMm = (event.clientX * scale - frameRect.left) * mmPerPx;
    const offsetYMm = (event.clientY * scale - frameRect.top) * mmPerPx;
    onAddPin(image.id, pinFractionAt(image, offsetXMm, offsetYMm));
  }

  function frameRectFor(handle: HTMLElement) {
    const frameElement = handle.parentElement;
    return frameElement === null ? null : frameElement.getBoundingClientRect();
  }

  function handleResizePointerDown(
    event: ReactPointerEvent<HTMLSpanElement>,
    image: PlacedImage,
    corner: ResizeCorner
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    const frameRect = frameRectFor(event.currentTarget);
    const areaElement = areaRef.current;
    if (frameRect === null || areaElement === null) {
      return;
    }

    rememberPointerScale();
    const session = startResize(
      image,
      corner,
      frameRect,
      areaElement.getBoundingClientRect(),
      scaledPointer(event)
    );
    if (session === null) {
      return;
    }

    resizeRef.current = session;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handleResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const session = resizeRef.current;
    if (session === null) {
      return;
    }

    onUpdateImage(session.id, resizeTo(session, scaledPointer(event)));
  }

  function handleResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    if (resizeRef.current === null) {
      return;
    }

    resizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleCropPointerDown(
    event: ReactPointerEvent<HTMLSpanElement>,
    image: PlacedImage,
    edge: CropEdge
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    const frameRect = frameRectFor(event.currentTarget);
    const areaElement = areaRef.current;
    if (frameRect === null || areaElement === null) {
      return;
    }

    rememberPointerScale();
    const session = startCrop(
      image,
      edge,
      frameRect,
      areaElement.getBoundingClientRect(),
      scaledPointer(event)
    );
    if (session === null) {
      return;
    }

    cropRef.current = session;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handleCropPointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const session = cropRef.current;
    if (session === null) {
      return;
    }

    onUpdateImage(session.id, cropTo(session, scaledPointer(event)));
  }

  function handleCropPointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    if (cropRef.current === null) {
      return;
    }

    cropRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>, image: PlacedImage) {
    const bounds = boundsFor(image.widthMm, event.currentTarget);
    if (bounds === null) {
      return;
    }

    const stepMm = event.shiftKey ? NUDGE_STEP_FAST_MM : NUDGE_STEP_MM;
    let deltaXMm = 0;
    let deltaYMm = 0;

    if (event.key === "ArrowLeft") {
      deltaXMm = -stepMm;
    } else if (event.key === "ArrowRight") {
      deltaXMm = stepMm;
    } else if (event.key === "ArrowUp") {
      deltaYMm = -stepMm;
    } else if (event.key === "ArrowDown") {
      deltaYMm = stepMm;
    } else {
      return;
    }

    event.preventDefault();
    onUpdateImage(image.id, {
      xMm: clampMm(image.xMm + deltaXMm, bounds.maxXMm),
      yMm: clampMm(image.yMm + deltaYMm, bounds.maxYMm),
    });
  }

  function handleTextBlockPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    textBlock: TextBlock
  ) {
    if (event.button !== 0) {
      return;
    }

    const bounds = boundsFor(textBlock.widthMm, event.currentTarget);
    if (bounds === null) {
      return;
    }

    rememberPointerScale();
    moveRef.current = {
      session: startDrag(textBlock, scaledPointer(event), bounds),
      pointerId: event.pointerId,
      element: event.currentTarget,
      moved: false,
      onMove: (id, position) => onUpdateTextBlock(id, position),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleTextBlockPointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
    textBlock: TextBlock
  ) {
    const gesture = moveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    moveRef.current = null;
    if (gesture.element.hasPointerCapture(event.pointerId)) {
      gesture.element.releasePointerCapture(event.pointerId);
    }

    if (!gesture.moved) {
      onSelect(textBlock.id);
    }
  }

  function handleTextBlockResizePointerDown(
    event: ReactPointerEvent<HTMLSpanElement>,
    textBlock: TextBlock,
    corner: ResizeCorner
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    const frameRect = frameRectFor(event.currentTarget);
    const areaElement = areaRef.current;
    if (frameRect === null || areaElement === null) {
      return;
    }

    rememberPointerScale();
    const session = startFrameResize(
      textBlock,
      corner,
      frameRect,
      areaElement.getBoundingClientRect(),
      scaledPointer(event)
    );
    if (session === null) {
      return;
    }

    textResizeRef.current = session;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handleTextBlockResizePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const session = textResizeRef.current;
    if (session === null) {
      return;
    }

    onUpdateTextBlock(session.id, frameResizeTo(session, scaledPointer(event)));
  }

  function handleTextBlockResizePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    if (textResizeRef.current === null) {
      return;
    }

    textResizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleTextBlockKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
    textBlock: TextBlock
  ) {
    const bounds = boundsFor(textBlock.widthMm, event.currentTarget);
    if (bounds === null) {
      return;
    }

    const stepMm = event.shiftKey ? NUDGE_STEP_FAST_MM : NUDGE_STEP_MM;
    let deltaXMm = 0;
    let deltaYMm = 0;

    if (event.key === "ArrowLeft") {
      deltaXMm = -stepMm;
    } else if (event.key === "ArrowRight") {
      deltaXMm = stepMm;
    } else if (event.key === "ArrowUp") {
      deltaYMm = -stepMm;
    } else if (event.key === "ArrowDown") {
      deltaYMm = stepMm;
    } else {
      return;
    }

    event.preventDefault();
    onUpdateTextBlock(textBlock.id, {
      xMm: clampMm(textBlock.xMm + deltaXMm, bounds.maxXMm),
      yMm: clampMm(textBlock.yMm + deltaYMm, bounds.maxYMm),
    });
  }

  function pinMmPerPx(): number | null {
    const areaElement = areaRef.current;
    if (areaElement === null) {
      return null;
    }

    const areaRect = areaElement.getBoundingClientRect();
    if (areaRect.width <= 0) {
      return null;
    }

    return page.widthMm / areaRect.width;
  }

  function handlePinPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    pin: Pin,
    image: PlacedImage
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    const mmPerPx = pinMmPerPx();
    if (mmPerPx === null) {
      return;
    }

    rememberPointerScale();
    const pointer = scaledPointer(event);
    pinMoveRef.current = {
      id: pin.id,
      image,
      xFraction: pin.xFraction,
      yFraction: pin.yFraction,
      clientX: pointer.clientX,
      clientY: pointer.clientY,
      mmPerPx,
      pointerId: event.pointerId,
      element: event.currentTarget,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePinPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = pinMoveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    const pointer = scaledPointer(event);

    if (!gesture.moved) {
      const deltaX = pointer.clientX - gesture.clientX;
      const deltaY = pointer.clientY - gesture.clientY;
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      gesture.moved = true;
    }

    const deltaXMm = (pointer.clientX - gesture.clientX) * gesture.mmPerPx;
    const deltaYMm = (pointer.clientY - gesture.clientY) * gesture.mmPerPx;
    onUpdatePin(
      gesture.id,
      moveFraction(
        gesture.image,
        { xFraction: gesture.xFraction, yFraction: gesture.yFraction },
        deltaXMm,
        deltaYMm
      )
    );
  }

  function handlePinPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = pinMoveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    pinMoveRef.current = null;
    if (gesture.element.hasPointerCapture(event.pointerId)) {
      gesture.element.releasePointerCapture(event.pointerId);
    }
  }

  function handlePinKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    pin: Pin,
    image: PlacedImage
  ) {
    const stepMm = event.shiftKey ? NUDGE_STEP_FAST_MM : NUDGE_STEP_MM;
    let deltaXMm = 0;
    let deltaYMm = 0;

    if (event.key === "ArrowLeft") {
      deltaXMm = -stepMm;
    } else if (event.key === "ArrowRight") {
      deltaXMm = stepMm;
    } else if (event.key === "ArrowUp") {
      deltaYMm = -stepMm;
    } else if (event.key === "ArrowDown") {
      deltaYMm = stepMm;
    } else {
      return;
    }

    event.preventDefault();
    onUpdatePin(pin.id, moveFraction(image, pin, deltaXMm, deltaYMm));
  }

  return (
    <section
      className="page"
      ref={pageRef}
      aria-label={`A4 page, ${orientation}`}
      style={{
        width: `${page.widthMm}mm`,
        height: `${page.heightMm}mm`,
      }}
    >
      <div
        className="page-content"
        ref={areaRef}
        onPointerDown={handleBackgroundPointerDown}
      >
        {images.map((image) => {
          const selected = image.id === selectedId;

          return (
            <div
              key={image.id}
              className={`image-frame${selected ? " is-selected" : ""}`}
              tabIndex={0}
              onPointerDown={(event) => handleFramePointerDown(event, image)}
              onPointerMove={handleFramePointerMove}
              onPointerUp={(event) => handleFramePointerUp(event, image)}
              onPointerCancel={(event) => handleFramePointerUp(event, image)}
              onContextMenu={(event) => handleFrameContextMenu(event, image)}
              onKeyDown={(event) => handleKeyDown(event, image)}
              style={{
                left: `${image.xMm}mm`,
                top: `${image.yMm}mm`,
                width: `${image.widthMm}mm`,
                height: `${image.heightMm}mm`,
              }}
            >
              <div className="image-crop">
                <img
                  className="placed-image"
                  src={image.src}
                  alt={image.name}
                  draggable={false}
                  style={{
                    left: `${image.imageXMm}mm`,
                    top: `${image.imageYMm}mm`,
                    width: `${image.imageWidthMm}mm`,
                  }}
                />
              </div>
              {selected && (
                <>
                  {CORNER_HANDLES.map((corner) => (
                    <span
                      key={corner}
                      className={`image-handle image-handle-${corner} screen-only`}
                      aria-hidden="true"
                      onPointerDown={(event) => handleResizePointerDown(event, image, corner)}
                      onPointerMove={handleResizePointerMove}
                      onPointerUp={handleResizePointerUp}
                      onPointerCancel={handleResizePointerUp}
                    />
                  ))}
                  {EDGE_HANDLES.map((edge) => (
                    <span
                      key={edge}
                      className={`image-handle image-handle-${edge} screen-only`}
                      aria-hidden="true"
                      onPointerDown={(event) => handleCropPointerDown(event, image, edge)}
                      onPointerMove={handleCropPointerMove}
                      onPointerUp={handleCropPointerUp}
                      onPointerCancel={handleCropPointerUp}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
        {textBlocks.map((textBlock) => {
          const selected = textBlock.id === selectedId;
          const theme = TEXT_BLOCK_THEMES[textBlock.theme];

          return (
            <div
              key={textBlock.id}
              className={`text-block-frame${selected ? " is-selected" : ""}`}
              tabIndex={0}
              onPointerDown={(event) => handleTextBlockPointerDown(event, textBlock)}
              onPointerMove={handleFramePointerMove}
              onPointerUp={(event) => handleTextBlockPointerUp(event, textBlock)}
              onPointerCancel={(event) => handleTextBlockPointerUp(event, textBlock)}
              onKeyDown={(event) => handleTextBlockKeyDown(event, textBlock)}
              style={{
                left: `${textBlock.xMm}mm`,
                top: `${textBlock.yMm}mm`,
                width: `${textBlock.widthMm}mm`,
                height: `${textBlock.heightMm}mm`,
              }}
            >
              <article className="text-block" style={{ borderColor: theme.titleColour }}>
                <h2 style={{ color: theme.titleColour }}>{textBlock.title}</h2>
                {textBlock.subtitle !== "" && (
                  <p className="text-block-subtitle" style={{ color: theme.subtitleColour }}>
                    {textBlock.subtitle}
                  </p>
                )}
                {textBlock.text !== "" && (
                  <div className="text-block-body">
                    <Markdown>{textBlock.text}</Markdown>
                  </div>
                )}
              </article>
              {selected &&
                CORNER_HANDLES.map((corner) => (
                  <span
                    key={corner}
                    className={`image-handle image-handle-${corner} screen-only`}
                    aria-hidden="true"
                    onPointerDown={(event) =>
                      handleTextBlockResizePointerDown(event, textBlock, corner)
                    }
                    onPointerMove={handleTextBlockResizePointerMove}
                    onPointerUp={handleTextBlockResizePointerUp}
                    onPointerCancel={handleTextBlockResizePointerUp}
                  />
                ))}
            </div>
          );
        })}
        {pins.map((pin) => {
          const image = images.find((item) => item.id === pin.imageId);
          if (image === undefined) {
            return null;
          }

          const position = pinPositionMm(pin, image);
          const selected = pin.id === selectedId;

          return (
            <button
              key={pin.id}
              type="button"
              className={`pin-marker${selected ? " is-selected" : ""}`}
              style={{ left: `${position.xMm}mm`, top: `${position.yMm}mm` }}
              aria-label={`Pin ${pin.number}`}
              onPointerDown={(event) => handlePinPointerDown(event, pin, image)}
              onPointerMove={handlePinPointerMove}
              onPointerUp={handlePinPointerUp}
              onPointerCancel={handlePinPointerUp}
              onKeyDown={(event) => handlePinKeyDown(event, pin, image)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(pin.id);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDeletePin(pin.id);
              }}
            >
              {pin.number}
            </button>
          );
        })}
      </div>
    </section>
  );
}
