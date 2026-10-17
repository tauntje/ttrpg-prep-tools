import { useState } from "react";
import { OrientationToggle } from "../../../shared/components/OrientationToggle";
import { PageViewport } from "../../../shared/components/PageViewport";
import { Sidebar } from "../../../shared/components/Sidebar";
import {
  DEFAULT_ORIENTATION,
  pageRule,
  pageSizeForOrientation,
} from "../../../shared/model/page";
import { sheetGrid } from "../../../shared/model/sheet";
import type { PageOrientation } from "../../../types/page";
import { CARD_GAP_MM, CARD_MARGIN_MM, CARD_SIZE_MM } from "../model/card";

const CARD_WIDTH_MM = CARD_SIZE_MM.widthMm;
const CARD_HEIGHT_MM = CARD_SIZE_MM.heightMm;

export function CardsTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const page = pageSizeForOrientation(orientation);
  const grid = sheetGrid(page, CARD_SIZE_MM, CARD_GAP_MM, CARD_MARGIN_MM);

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <section className="placeholder">
            <h3>Card maker</h3>
            <p>
              Card size: {CARD_WIDTH_MM} mm by {CARD_HEIGHT_MM} mm.
            </p>
            <p>Each page holds {grid.perPage} cards. The editor comes later.</p>
          </section>
        </Sidebar>
        <PageViewport>
          <section
            className="page"
            aria-label={`A4 page, ${orientation}`}
            style={{ width: `${page.widthMm}mm`, height: `${page.heightMm}mm` }}
          >
            <div className="page-content" />
          </section>
        </PageViewport>
      </div>
    </>
  );
}
