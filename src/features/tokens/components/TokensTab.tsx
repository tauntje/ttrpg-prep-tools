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
import { TOKEN_GAP_MM, TOKEN_MARGIN_MM, TOKEN_SIZES_MM, tokenItemSize } from "../model/token";

export function TokensTab() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const page = pageSizeForOrientation(orientation);
  const capacities = TOKEN_SIZES_MM.map((sizeMm) => ({
    sizeMm,
    perPage: sheetGrid(page, tokenItemSize(sizeMm), TOKEN_GAP_MM, TOKEN_MARGIN_MM).perPage,
  }));

  return (
    <>
      <style>{pageRule(orientation)}</style>
      <div className="workspace">
        <Sidebar>
          <OrientationToggle orientation={orientation} onChange={setOrientation} />
          <section className="placeholder">
            <h3>Token maker</h3>
            {capacities.map(({ sizeMm, perPage }) => (
              <p key={sizeMm}>
                {sizeMm} mm tokens: {perPage} on each page.
              </p>
            ))}
            <p>The editor comes later.</p>
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
