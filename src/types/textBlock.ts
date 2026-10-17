export type TextBlockType = "information" | "dwellers" | "legend";

export interface TextBlock {
  id: string;
  type: TextBlockType;
  title: string;
  subtitle: string;
  colour: string;
  bullets: string[];
  text: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}
