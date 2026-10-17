import { DEFAULT_PAGE } from "../model/page";

export function PageCanvas() {
  return (
    <section
      className="page"
      aria-label="A4 page"
      style={{
        width: `${DEFAULT_PAGE.widthMm}mm`,
        height: `${DEFAULT_PAGE.heightMm}mm`,
      }}
    >
      <div className="page-content">
      </div>
    </section>
  );
}
