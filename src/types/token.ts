export type TokenSizeMm = 25 | 50 | 75;

export interface Token {
  id: string;
  name: string;
  src: string;
  sizeMm: TokenSizeMm;
  ringColour: string;
  imageAspect: number;
  imageXMm: number;
  imageYMm: number;
  imageScale: number;
}
