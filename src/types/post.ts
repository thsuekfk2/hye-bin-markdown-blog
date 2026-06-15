import type { NotionBlock } from "./notion";

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
  blocks?: NotionBlock[];
}

export type QueryFilter = { type: "post" | "log"; slug: string };
