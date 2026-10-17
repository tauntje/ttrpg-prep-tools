import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  DEFAULT_ZOOM,
  clampZoom,
  wheelDeltaToPixels,
  zoomFactorFromWheel,
} from "../model/zoom";
import { ZoomBar } from "./ZoomBar";

interface PageViewportProps {
  children: ReactNode;
}

interface ZoomAnchor {
  fractionX: number;
  fractionY: number;
  clientX: number;
  clientY: number;
}

interface PanSession {
  pointerId: number;
  clientX: number;
  clientY: number;
  scrollLeft: number;
  scrollTop: number;
}

interface PinchGestureEvent extends Event {
  scale: number;
  clientX: number;
  clientY: number;
}

/** The page moves faster than the pointer during a pan. */
const PAN_TRACKING = 2;

/** A control keeps its own key input. */
function isControl(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (element === null) {
    return false;
  }

  return (
    element.isContentEditable ||
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.tagName === "BUTTON"
  );
}

/**
 * Show one page on a stage that the user can zoom.
 *
 * The stage holds a zoom bar. The user changes the zoom with the bar,
 * with ctrl and wheel, or with a trackpad pinch. The user moves the page
 * with a trackpad scroll or with the spacebar and a drag.
 */
export function PageViewport({ children }: PageViewportProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panReady, setPanReady] = useState(false);
  const [panning, setPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const anchorRef = useRef<ZoomAnchor | null>(null);
  const panRef = useRef<PanSession | null>(null);
  const panReadyRef = useRef(false);

  function pageElement(): HTMLElement | null {
    const viewport = viewportRef.current;
    return viewport === null ? null : viewport.querySelector<HTMLElement>(".page");
  }

  /** Set the zoom. Keep the point below the pointer in place. */
  function zoomAt(nextZoom: number, clientX?: number, clientY?: number) {
    const clamped = clampZoom(nextZoom);
    if (clamped === zoomRef.current) {
      return;
    }

    const page = pageElement();

    if (page !== null && clientX !== undefined && clientY !== undefined) {
      const rect = page.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        anchorRef.current = {
          fractionX: (clientX - rect.left) / rect.width,
          fractionY: (clientY - rect.top) / rect.height,
          clientX,
          clientY,
        };
      }
    }

    zoomRef.current = clamped;
    setZoom(clamped);
  }

  function changePanReady(value: boolean) {
    panReadyRef.current = value;
    setPanReady(value);
  }

  // Move the scroll position. The zoom of the page changed.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const viewport = viewportRef.current;
    if (anchor === null || viewport === null) {
      return;
    }

    anchorRef.current = null;
    const page = pageElement();
    if (page === null) {
      return;
    }

    const rect = page.getBoundingClientRect();
    const nextClientX = rect.left + anchor.fractionX * rect.width;
    const nextClientY = rect.top + anchor.fractionY * rect.height;
    viewport.scrollLeft += nextClientX - anchor.clientX;
    viewport.scrollTop += nextClientY - anchor.clientY;
  }, [zoom]);

  // The spacebar starts the pan mode.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || isControl(event.target)) {
        return;
      }

      event.preventDefault();
      changePanReady(true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code !== "Space") {
        return;
      }

      changePanReady(false);
    }

    function handleBlur() {
      changePanReady(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Ctrl and wheel give a zoom. A trackpad pinch gives the same input.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      const pixels = wheelDeltaToPixels(event.deltaY, event.deltaMode);
      const factor = zoomFactorFromWheel(pixels);
      zoomAt(zoomRef.current * factor, event.clientX, event.clientY);
    }

    let gestureBase = DEFAULT_ZOOM;

    function handleGestureStart(event: PinchGestureEvent) {
      event.preventDefault();
      gestureBase = zoomRef.current;
    }

    function handleGestureChange(event: PinchGestureEvent) {
      event.preventDefault();
      zoomAt(gestureBase * event.scale, event.clientX, event.clientY);
    }

    function handleGestureEnd(event: PinchGestureEvent) {
      event.preventDefault();
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("gesturestart", handleGestureStart as EventListener, {
      passive: false,
    });
    viewport.addEventListener("gesturechange", handleGestureChange as EventListener, {
      passive: false,
    });
    viewport.addEventListener("gestureend", handleGestureEnd as EventListener, {
      passive: false,
    });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("gesturestart", handleGestureStart as EventListener);
      viewport.removeEventListener("gesturechange", handleGestureChange as EventListener);
      viewport.removeEventListener("gestureend", handleGestureEnd as EventListener);
    };
  }, []);

  function handlePointerDownCapture(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panReadyRef.current || event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }

    // Stop the page items. The drag moves the page.
    event.preventDefault();
    event.stopPropagation();
    panRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setPanning(true);
    viewport.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    const viewport = viewportRef.current;
    if (pan === null || viewport === null || pan.pointerId !== event.pointerId) {
      return;
    }

    viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.clientX) * PAN_TRACKING;
    viewport.scrollTop = pan.scrollTop - (event.clientY - pan.clientY) * PAN_TRACKING;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    const viewport = viewportRef.current;
    if (pan === null || viewport === null || pan.pointerId !== event.pointerId) {
      return;
    }

    panRef.current = null;
    setPanning(false);
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  }

  const viewportClass =
    "preview-viewport" +
    (panReady ? " is-pan-ready" : "") +
    (panning ? " is-panning" : "");

  return (
    <main className="preview">
      <div
        className={viewportClass}
        ref={viewportRef}
        style={{ "--page-zoom": zoom } as CSSProperties}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="page-stage">{children}</div>
      </div>
      <ZoomBar zoom={zoom} onChange={(value) => zoomAt(value)} />
    </main>
  );
}
