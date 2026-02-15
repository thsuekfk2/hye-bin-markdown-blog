import type { NotionBlock } from "./notion";

// 기본 포스트 타입
interface BaseNotionPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  description?: string;
  thumbnail?: string;
  originalThumbnail?: string;
  published: boolean;
  tags?: string[];
  blocks?: NotionBlock[];
}

// 일반 포스트/로그
interface RegularPost extends BaseNotionPost {
  category?: "post" | "log";
  bookTitle?: never;
  chapterNumber?: never;
}

// 책 챕터
interface BookChapter extends BaseNotionPost {
  category: "book";
  bookTitle: string;
  chapterNumber?: number;
}

export type NotionPost = RegularPost | BookChapter;

// 쿼리 필터 타입
export type QueryFilter =
  | { type: "post" | "log"; slug: string }
  | { type: "book"; bookName: string; slug: string };

// 책 정보 타입
export interface BookInfo {
  name: string;
  thumbnail: string;
  description: string;
  chapterCount: number;
}
