export interface TemplatePage {
  id: string;
  title: string;
  content: TemplatePageContent;
  children?: TemplatePage[];
}

export interface TemplatePageContent {
  heading: string;
  description?: string;
  callout?: {
    title: string;
    items: string[];
  };
  sections?: {
    title: string;
    content?: string;
  }[];
}

export interface TemplateData {
  id: string;
  name: string;
  pages: TemplatePage[];
}
