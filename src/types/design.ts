import type { PlacedImage } from "./image";
import type { PageOrientation, PageSize } from "./page";
import type { TextBlock } from "./textBlock";

export interface Design {
  id: string;
  page: PageSize;
  orientation: PageOrientation;
  images: PlacedImage[];
  textBlocks: TextBlock[];
}
