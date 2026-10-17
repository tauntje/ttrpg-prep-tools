import type { PlacedImage } from "./image";
import type { PageOrientation, PageSize } from "./page";

export interface Design {
  id: string;
  page: PageSize;
  orientation: PageOrientation;
  images: PlacedImage[];
}
