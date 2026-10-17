export type TokenSizeMm = 25 | 50 | 75;

export interface Token {
  id: string;
  name: string;
  src: string;
  sizeMm: TokenSizeMm;
  ringColour: string;
  imageXMm: number;
  imageYMm: number;
  imageScale: number;
}
