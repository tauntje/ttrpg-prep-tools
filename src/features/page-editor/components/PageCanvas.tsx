import { useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { PlacedImage } from "../../../types/image";
import type { PageOrientation } from "../../../types/page";
import type { TextBlock } from "../../../types/textBlock";
import {
  clampMm,
  dragTo,
  placementBounds,
  startDrag,
  type DragSession,
  type PointMm,
} from "../model/drag";
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
} from "../model/resize";
import { pageSizeForOrientation } from "../model/page";

interface PageCanvasProps {
  orientation: PageOrientation;
  images: PlacedImage[];
  textBlocks: TextBlock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateImage: (id: string, patch: Partial<PlacedImage>) => void;
  onUpdateTextBlock: (id: string, patch: Partial<TextBlock>) => void;
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

export function PageCanvas({
  orientation,
  images,
  textBlocks,
  selectedId,
  onSelect,
  onUpdateImage,
  onUpdateTextBlock,
}: PageCanvasProps) {
  const page = pageSizeForOrientation(orientation);
  const areaRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<MoveGesture | null>(null);
  const resizeRef = useRef<ResizeSession | null>(null);
  const cropRef = useRef<CropSession | null>(null);
  const textResizeRef = useRef<FrameResizeSession | null>(null);

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

    moveRef.current = {
      session: startDrag(image, event, bounds),
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

    if (!gesture.moved) {
      const deltaX = event.clientX - gesture.session.clientX;
      const deltaY = event.clientY - gesture.session.clientY;
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      gesture.moved = true;
    }

    const position = dragTo(gesture.session, event);
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

    const session = startResize(
      image,
      corner,
      frameRect,
      areaElement.getBoundingClientRect(),
      event
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

    onUpdateImage(session.id, resizeTo(session, event));
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

    const session = startCrop(
      image,
      edge,
      frameRect,
      areaElement.getBoundingClientRect(),
      event
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

    onUpdateImage(session.id, cropTo(session, event));
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

    moveRef.current = {
      session: startDrag(textBlock, event, bounds),
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

    const session = startFrameResize(
      textBlock,
      corner,
      frameRect,
      areaElement.getBoundingClientRect(),
      event
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

    onUpdateTextBlock(session.id, frameResizeTo(session, event));
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

  return (
    <section
      className="page"
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
              <article className="text-block" style={{ borderColor: textBlock.colour }}>
                <h2 style={{ color: textBlock.colour }}>{textBlock.title}</h2>
                {textBlock.subtitle !== "" && (
                  <p className="text-block-subtitle">{textBlock.subtitle}</p>
                )}
                {textBlock.text !== "" && <p>{textBlock.text}</p>}
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
      </div>
    </section>
  );
}
