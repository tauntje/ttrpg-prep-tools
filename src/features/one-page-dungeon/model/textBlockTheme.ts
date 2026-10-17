import type { TextBlockThemeId } from "../../../types/textBlock";

export interface TextBlockTheme {
  id: TextBlockThemeId;
  label: string;
  titleColour: string;
  subtitleColour: string;
}

export const TEXT_BLOCK_THEMES: Record<TextBlockThemeId, TextBlockTheme> = {
  terracotta: {
    id: "terracotta",
    label: "Terracotta",
    titleColour: "#b26a4c",
    subtitleColour: "#8a4a2e",
  },
  teal: {
    id: "teal",
    label: "Teal",
    titleColour: "#3f7a72",
    subtitleColour: "#2c574f",
  },
  indigo: {
    id: "indigo",
    label: "Indigo",
    titleColour: "#5a63a8",
    subtitleColour: "#3f4677",
  },
};

export const TEXT_BLOCK_THEME_LIST = Object.values(TEXT_BLOCK_THEMES);
