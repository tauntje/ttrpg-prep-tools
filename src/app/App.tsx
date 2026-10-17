import { useState } from "react";
import { ImageImporter } from "../features/images/components/ImageImporter";
import { PageCanvas } from "../features/page-editor/components/PageCanvas";
import { OrientationToggle } from "../features/page-editor/components/OrientationToggle";
import { DEFAULT_ORIENTATION } from "../features/page-editor/model/page";
import { AppHeader } from "../shared/components/AppHeader";
import { Sidebar } from "../shared/components/Sidebar";
import type { PlacedImage } from "../types/image";
import type { PageOrientation } from "../types/page";

function pageRule(orientation: PageOrientation): string {
  return `@page { size: A4 ${orientation}; }`;
}

export function App() {
  const [orientation, setOrientation] = useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [images, setImages] = useState<PlacedImage[]>([]);

  function handlePlaceImage(image: PlacedImage) {
    setImages((current) => [...current, image]);
  }

  return (
    <div className="app">
      <style>{pageRule(orientation)}</style>
      <AppHeader>
        <OrientationToggle orientation={orientation} onChange={setOrientation} />
      </AppHeader>
      <div className="workspace">
        <Sidebar>
          <ImageImporter imageCount={images.length} onPlace={handlePlaceImage} />
        </Sidebar>
        <main className="preview">
          <PageCanvas orientation={orientation} images={images} />
        </main>
      </div>
    </div>
  );
}
