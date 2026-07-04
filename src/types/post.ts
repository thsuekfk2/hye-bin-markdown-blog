export interface TocItem {
  text: string;
  level: number;
  slug: string;
}

export interface NotionPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  description?: string;
  thumbnail?: string;
  originalThumbnail?: string;
  published: boolean;
  category?: string;
  tags?: string[];
  markdown?: string;
  headings?: TocItem[];
}
