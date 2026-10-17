import type { PlacedImage } from "../../../types/image";
import type { PageOrientation } from "../../../types/page";
import { pageSizeForOrientation } from "../model/page";

interface PageCanvasProps {
  orientation: PageOrientation;
  images: PlacedImage[];
}

export function PageCanvas({ orientation, images }: PageCanvasProps) {
  const page = pageSizeForOrientation(orientation);

  return (
    <section
      className="page"
      aria-label={`A4 page, ${orientation}`}
      style={{
        width: `${page.widthMm}mm`,
        height: `${page.heightMm}mm`,
      }}
    >
      <div className="page-content">
        {images.map((image) => (
          <img
            key={image.id}
            className="placed-image"
            src={image.src}
            alt={image.name}
            style={{
              left: `${image.xMm}mm`,
              top: `${image.yMm}mm`,
              width: `${image.widthMm}mm`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
