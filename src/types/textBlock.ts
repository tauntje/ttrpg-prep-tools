export type TextBlockType = "information" | "dwellers" | "legend";

export type TextBlockThemeId = "terracotta" | "teal" | "indigo";

export interface TextBlock {
  id: string;
  type: TextBlockType;
  title: string;
  subtitle: string;
  theme: TextBlockThemeId;
  bullets: string[];
  text: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}
