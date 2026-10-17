import { useRef } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { pageSizeForOrientation } from "../../../shared/model/page";
import { sheetSlot, type SheetGrid } from "../../../shared/model/sheet";
import type { PageOrientation } from "../../../types/page";
import type { Token } from "../../../types/token";
import { DEFAULT_TOKEN_SIZE_MM, tokenGrid, tokenPages } from "../model/token";
import { TokenView } from "./TokenView";

interface TokenSheetProps {
  orientation: PageOrientation;
  tokens: Token[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveImage: (id: string, offset: { xMm: number; yMm: number }) => void;
}

const NUDGE_STEP_MM = 1;
const NUDGE_STEP_FAST_MM = 5;
const DRAG_THRESHOLD_PX = 3;

interface MoveGesture {
  id: string;
  pointerId: number;
  clientX: number;
  clientY: number;
  imageXMm: number;
  imageYMm: number;
  mmPerPx: number;
  element: HTMLElement;
  moved: boolean;
}

/**
 * Lay the tokens on A4 pages. Each token size fills its own pages.
 * Drag a token to move the picture. Select a token to edit it.
 */
export function TokenSheet({
  orientation,
  tokens,
  selectedId,
  onSelect,
  onMoveImage,
}: TokenSheetProps) {
  const page = pageSizeForOrientation(orientation);
  const pages = tokenPages(orientation, tokens);
  const moveRef = useRef<MoveGesture | null>(null);
  const emptyGrid = tokenGrid(orientation, DEFAULT_TOKEN_SIZE_MM);
  const sheets =
    pages.length > 0
      ? pages
      : [{ sizeMm: DEFAULT_TOKEN_SIZE_MM, grid: emptyGrid, tokens: [] }];

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>, token: Token) {
    if (event.button !== 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    moveRef.current = {
      id: token.id,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      imageXMm: token.imageXMm,
      imageYMm: token.imageYMm,
      mmPerPx: token.sizeMm / rect.width,
      element: event.currentTarget,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = moveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.clientX;
    const deltaY = event.clientY - gesture.clientY;

    if (!gesture.moved) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      gesture.moved = true;
    }

    onMoveImage(gesture.id, {
      xMm: gesture.imageXMm + deltaX * gesture.mmPerPx,
      yMm: gesture.imageYMm + deltaY * gesture.mmPerPx,
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>, token: Token) {
    const gesture = moveRef.current;
    if (gesture === null || gesture.pointerId !== event.pointerId) {
      return;
    }

    moveRef.current = null;
    if (gesture.element.hasPointerCapture(event.pointerId)) {
      gesture.element.releasePointerCapture(event.pointerId);
    }

    if (!gesture.moved) {
      onSelect(token.id);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>, token: Token) {
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
    onMoveImage(token.id, {
      xMm: token.imageXMm + deltaXMm,
      yMm: token.imageYMm + deltaYMm,
    });
  }

  function renderToken(token: Token, index: number, grid: SheetGrid) {
    const slot = sheetSlot(grid, index);
    const selected = token.id === selectedId;

    return (
      <div
        key={token.id}
        className={`token-slot${selected ? " is-selected" : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onPointerDown={(event) => handlePointerDown(event, token)}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => handlePointerUp(event, token)}
        onPointerCancel={(event) => handlePointerUp(event, token)}
        onKeyDown={(event) => handleKeyDown(event, token)}
        style={{
          left: `${slot.xMm}mm`,
          top: `${slot.yMm}mm`,
          width: `${slot.widthMm}mm`,
          height: `${slot.heightMm}mm`,
        }}
      >
        <TokenView token={token} />
      </div>
    );
  }

  return (
    <div className="token-sheet">
      {sheets.map((sheet, pageIndex) => (
        <section
          key={pageIndex}
          className="page token-page"
          aria-label={`A4 page ${pageIndex + 1}, ${orientation}`}
          style={{ width: `${page.widthMm}mm`, height: `${page.heightMm}mm` }}
        >
          <div className="token-page-content">
            {sheet.tokens.length === 0 && (
              <p className="token-page-hint screen-only">
                Select Import picture to put a token on this page.
              </p>
            )}
            {sheet.tokens.map((token, index) => renderToken(token, index, sheet.grid))}
          </div>
        </section>
      ))}
    </div>
  );
}
