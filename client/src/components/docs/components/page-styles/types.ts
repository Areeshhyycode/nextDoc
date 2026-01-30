export interface PageStyles {
  fontStyle: 'system' | 'serif' | 'mono' | 'inter' | 'roboto' | 'playfair';
  fontSize: 'small' | 'default' | 'large';
  pageWidth: 'default' | 'full';
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  h1Color: string;
  h2Color: string;
  h3Color: string;
  h4Color: string;
  h5Color: string;
  h6Color: string;
  linkColor: string;
  codeBlockBg: string;
  codeBlockText: string;
  blockquoteBg: string;
  blockquoteText: string;
  tableBorderColor: string;
  tableHeaderBg: string;
  showPageOutline: boolean;
}

export interface PageStylesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  styles: PageStyles;
  onStyleChange: (styles: Partial<PageStyles>) => void;
  onInsertTable?: (rows: number, cols: number) => void;
}

/** Font family option config */
export interface FontOption {
  value: PageStyles['fontStyle'];
  label: string;
  preview: string;
  className?: string;
  style?: React.CSSProperties;
  testId: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: 'system', label: 'System', preview: 'Aa', testId: 'font-style-system' },
  { value: 'serif', label: 'Serif', preview: 'Ss', className: 'font-serif', testId: 'font-style-serif' },
  { value: 'mono', label: 'Mono', preview: '00', className: 'font-mono', testId: 'font-style-mono' },
  { value: 'inter', label: 'Inter', preview: 'Aa', style: { fontFamily: 'Inter, sans-serif' }, testId: 'font-style-inter' },
  { value: 'roboto', label: 'Roboto', preview: 'Aa', style: { fontFamily: 'Roboto, sans-serif' }, testId: 'font-style-roboto' },
  { value: 'playfair', label: 'Playfair', preview: 'Aa', style: { fontFamily: 'Playfair Display, serif' }, testId: 'font-style-playfair' },
];

/** Font size option config */
export interface FontSizeOption {
  value: PageStyles['fontSize'];
  label: string;
  sizeClass: string;
  testId: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'small', label: 'Small', sizeClass: 'text-sm', testId: 'font-size-small' },
  { value: 'default', label: 'Default', sizeClass: 'text-base', testId: 'font-size-default' },
  { value: 'large', label: 'Large', sizeClass: 'text-lg', testId: 'font-size-large' },
];

/** Color picker row config */
export interface ColorRow {
  label: string;
  styleKey: keyof PageStyles;
}

/** Color table section */
export interface ColorTableSection {
  heading: string;
  rows: ColorRow[];
}

export const COLOR_TABLES: ColorTableSection[] = [
  {
    heading: 'Basic',
    rows: [
      { label: 'Background', styleKey: 'backgroundColor' },
      { label: 'Text', styleKey: 'textColor' },
      { label: 'Links', styleKey: 'linkColor' },
    ],
  },
  {
    heading: 'Headings',
    rows: [
      { label: 'H1 (Title)', styleKey: 'h1Color' },
      { label: 'H2', styleKey: 'h2Color' },
      { label: 'H3', styleKey: 'h3Color' },
      { label: 'H4', styleKey: 'h4Color' },
      { label: 'H5', styleKey: 'h5Color' },
      { label: 'H6', styleKey: 'h6Color' },
    ],
  },
  {
    heading: 'Elements',
    rows: [
      { label: 'Code Block BG', styleKey: 'codeBlockBg' },
      { label: 'Code Block Text', styleKey: 'codeBlockText' },
      { label: 'Quote BG', styleKey: 'blockquoteBg' },
      { label: 'Quote Text', styleKey: 'blockquoteText' },
      { label: 'Table Border', styleKey: 'tableBorderColor' },
      { label: 'Table Header BG', styleKey: 'tableHeaderBg' },
    ],
  },
];

/** Color preset config */
export interface ColorPreset {
  label: string;
  swatches: [string, string, string];
  styles: Partial<PageStyles>;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    label: 'Default',
    swatches: ['bg-white border border-gray-300', 'bg-gray-800', 'bg-blue-500'],
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      headingColor: '#111827',
      h1Color: '#111827',
      h2Color: '#1f2937',
      h3Color: '#374151',
      h4Color: '#4b5563',
      h5Color: '#6b7280',
      h6Color: '#9ca3af',
      linkColor: '#3b82f6',
      codeBlockBg: '#f3f4f6',
      codeBlockText: '#1f2937',
      blockquoteBg: '#f9fafb',
      blockquoteText: '#4b5563',
      tableBorderColor: '#e5e7eb',
      tableHeaderBg: '#f3f4f6',
    },
  },
  {
    label: 'Dark',
    swatches: ['bg-slate-800', 'bg-slate-200', 'bg-blue-400'],
    styles: {
      backgroundColor: '#1e293b',
      textColor: '#e2e8f0',
      headingColor: '#f1f5f9',
      h1Color: '#f1f5f9',
      h2Color: '#e2e8f0',
      h3Color: '#cbd5e1',
      h4Color: '#94a3b8',
      h5Color: '#64748b',
      h6Color: '#475569',
      linkColor: '#60a5fa',
      codeBlockBg: '#0f172a',
      codeBlockText: '#e2e8f0',
      blockquoteBg: '#334155',
      blockquoteText: '#cbd5e1',
      tableBorderColor: '#475569',
      tableHeaderBg: '#334155',
    },
  },
  {
    label: 'Warm',
    swatches: ['bg-amber-100', 'bg-amber-900', 'bg-orange-600'],
    styles: {
      backgroundColor: '#fef3c7',
      textColor: '#78350f',
      headingColor: '#451a03',
      h1Color: '#451a03',
      h2Color: '#78350f',
      h3Color: '#92400e',
      h4Color: '#b45309',
      h5Color: '#d97706',
      h6Color: '#f59e0b',
      linkColor: '#ea580c',
      codeBlockBg: '#fef9c3',
      codeBlockText: '#78350f',
      blockquoteBg: '#fef9c3',
      blockquoteText: '#92400e',
      tableBorderColor: '#fde68a',
      tableHeaderBg: '#fef9c3',
    },
  },
  {
    label: 'Nature',
    swatches: ['bg-emerald-50', 'bg-emerald-900', 'bg-emerald-500'],
    styles: {
      backgroundColor: '#ecfdf5',
      textColor: '#064e3b',
      headingColor: '#022c22',
      h1Color: '#022c22',
      h2Color: '#064e3b',
      h3Color: '#065f46',
      h4Color: '#047857',
      h5Color: '#059669',
      h6Color: '#10b981',
      linkColor: '#10b981',
      codeBlockBg: '#d1fae5',
      codeBlockText: '#064e3b',
      blockquoteBg: '#d1fae5',
      blockquoteText: '#065f46',
      tableBorderColor: '#a7f3d0',
      tableHeaderBg: '#d1fae5',
    },
  },
];

export const TABLE_OPTIONS = [
  { label: '2 x 2', rows: 2, cols: 2 },
  { label: '2 x 3', rows: 2, cols: 3 },
  { label: '3 x 2', rows: 3, cols: 2 },
  { label: '3 x 3', rows: 3, cols: 3 },
  { label: '3 x 4', rows: 3, cols: 4 },
  { label: '4 x 3', rows: 4, cols: 3 },
  { label: '4 x 4', rows: 4, cols: 4 },
  { label: '3 x 5', rows: 3, cols: 5 },
  { label: '5 x 3', rows: 5, cols: 3 },
  { label: '5 x 5', rows: 5, cols: 5 },
];
