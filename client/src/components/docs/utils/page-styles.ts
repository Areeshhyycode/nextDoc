export type FontStyle = "system" | "serif" | "mono";
export type FontSize = "small" | "default" | "large";
export type PageWidth = "default" | "full";

const FONT_MAP: Record<FontStyle, string> = {
  system: "",
  serif: "font-serif",
  mono: "font-mono",
};

const SIZE_MAP: Record<FontSize, string> = {
  small: "text-sm",
  default: "text-base",
  large: "text-lg",
};

const WIDTH_MAP: Record<PageWidth, string> = {
  default: "max-w-4xl",
  full: "max-w-full px-8",
};

export const getFontClass = (fontStyle: FontStyle) => FONT_MAP[fontStyle];
export const getFontSizeClass = (fontSize: FontSize) => SIZE_MAP[fontSize];
export const getWidthClass = (pageWidth: PageWidth) => WIDTH_MAP[pageWidth];
