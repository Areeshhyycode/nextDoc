export type FontStyle = "system" | "serif" | "mono" | "inter" | "roboto" | "playfair";
export type FontSize = "small" | "default" | "large";
export type PageWidth = "default" | "full";

const FONT_MAP: Record<FontStyle, string> = {
  system: "",
  serif: "font-serif",
  mono: "font-mono",
  inter: "font-inter",
  roboto: "font-roboto",
  playfair: "font-playfair",
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

// Apply custom colors to an element
export const applyColorStyles = (
  element: HTMLElement,
  backgroundColor: string,
  textColor: string,
  headingColor: string,
  linkColor: string
) => {
  element.style.backgroundColor = backgroundColor;
  element.style.color = textColor;

  // Apply heading colors
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    (heading as HTMLElement).style.color = headingColor;
  });

  // Apply link colors
  const links = element.querySelectorAll('a');
  links.forEach(link => {
    (link as HTMLElement).style.color = linkColor;
  });
};
