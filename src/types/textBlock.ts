export type TextBlockType = "context" | "dwellers" | "legend";

export type TextBlockThemeId = "terracotta" | "teal" | "indigo";

export interface TextBlock {
  id: string;
  pinId?: string;
  type: TextBlockType;
  title: string;
  subtitle: string;
  theme: TextBlockThemeId;
  bullets: string[];
  text: string;
}
