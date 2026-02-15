import { Client } from "@notionhq/client";
import { cache } from "react";
import { generateS3Url } from "./s3";
import { IMAGE } from "./constants";
import type { NotionBlock, ImageBlock } from "@/types/notion";

// Notion 공식 API 클라이언트
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 쿼리 필터 타입
type SlugFilter = {
  type: "post" | "log";
  slug: string;
};

type BookChapterFilter = {
  type: "book";
  bookName: string;
  slug: string;
};

type QueryFilter = SlugFilter | BookChapterFilter;

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

async function mapNotionPageToPost(page: any): Promise<NotionPost> {
  const slug =
    page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") ||
    "";
  const originalThumbnail =
    page.properties.Thumbnail?.files?.[0]?.external?.url ||
    page.properties.Thumbnail?.files?.[0]?.file?.url ||
    "";

  // S3 URL 직접 생성
  let thumbnail = originalThumbnail;
  if (originalThumbnail && originalThumbnail.includes("amazonaws.com")) {
    thumbnail = generateS3Url(originalThumbnail, slug);
  }

  return {
    id: page.id,
    title:
      page.properties["이름"]?.title?.map((t: any) => t.plain_text).join("") ||
      "Untitled",
    slug:
      page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") ||
      "",
    date: page.properties.Date?.date?.start || "",
    description:
      page.properties.Description?.rich_text
        ?.map((t: any) => t.plain_text)
        .join("") || "",
    thumbnail,
    originalThumbnail,
    published: page.properties.Status?.select?.name === "발행" || false,
    category: page.properties.Category?.select?.name || "",
    tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    bookTitle: page.properties.BookTitle?.select?.name || "",
    chapterNumber: page.properties.ChapterNumber?.number || undefined,
  };
}

// 카테고리별 필터링 함수
function filterByCategory(
  posts: NotionPost[],
  category: "post" | "log",
  limit?: number,
): NotionPost[] {
  const filtered = posts.filter(
    (post) =>
      post.category?.toLowerCase() === category && post.published && post.slug,
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

const queryNotionDatabase = cache(async (): Promise<NotionPost[]> => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    return Promise.all(response.results.map(mapNotionPageToPost));
  } catch (error) {
    console.error("Error querying notion database:", error);
    return [];
  }
});

// 데이터베이스에서 로그 목록 가져오기 (이미 날짜순 정렬됨)
export async function getNotionLogs(): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return filterByCategory(posts, "log");
}

// 최근 포스트 가져오기
export async function getRecentPosts(limit: number = 4): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return filterByCategory(posts, "post", limit);
}

// 최근 로그 가져오기
export async function getRecentLogs(limit: number = 4): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return filterByCategory(posts, "log", limit);
}

// 데이터베이스에서 포스트 목록 가져오기 (이미 날짜순 정렬됨)
export async function getNotionPosts(): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return filterByCategory(posts, "post");
}

// 모든 태그 가져오기
export async function getAllTags(): Promise<string[]> {
  const posts = await queryNotionDatabase();
  const allTags = posts
    .filter((post) => post.published && post.slug)
    .flatMap((post) => post.tags || []);

  // 중복 제거 및 알파벳 순 정렬
  return Array.from(new Set(allTags)).sort();
}

// 태그별 포스트 가져오기 (포스트와 로그 모두 포함)
export async function getPostsByTag(tag: string): Promise<NotionPost[]> {
  const allPosts = await queryNotionDatabase();
  return allPosts.filter(
    (post) => post.published && post.slug && post.tags?.includes(tag),
  );
}

// 필터 타입에 따라 Notion 필터 생성
function buildQueryFilter(filter: QueryFilter) {
  if (filter.type === "book") {
    return {
      and: [
        { property: "Category", select: { equals: "book" } },
        { property: "BookTitle", select: { equals: filter.bookName } },
        { property: "Slug", rich_text: { equals: filter.slug } },
      ],
    };
  }
  return { property: "Slug", rich_text: { equals: filter.slug } };
}

// 단일 페이지 메타데이터 조회
async function fetchPageMetadata(
  filter: QueryFilter,
): Promise<NotionPost | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: buildQueryFilter(filter),
    });

    if (response.results.length === 0) return null;
    return await mapNotionPageToPost(response.results[0] as any);
  } catch (error) {
    console.error("Error fetching page metadata:", { filter, error });
    return null;
  }
}

// 단일 페이지 + 블록 조회
async function fetchPageWithBlocks(
  filter: QueryFilter,
): Promise<(NotionPost & { blocks: any[] }) | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: buildQueryFilter(filter),
    });

    if (response.results.length === 0) return null;

    const page = response.results[0] as any;
    const pageSlug =
      page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") ||
      filter.slug;
    const blocks = await getPageBlocks(page.id, pageSlug);
    const post = await mapNotionPageToPost(page);

    return { ...post, blocks };
  } catch (error) {
    console.error("Error fetching page with blocks:", { filter, error });
    return null;
  }
}

// 메타데이터용 포스트 정보만 가져오기
export async function getNotionPostMetadata(slug: string) {
  return fetchPageMetadata({ type: "post", slug });
}

// 특정 포스트 가져오기
export async function getNotionPost(slug: string) {
  return fetchPageWithBlocks({ type: "post", slug });
}

// 이미지 블록인지 확인
function isImageBlock(block: NotionBlock): block is ImageBlock {
  return block.type === "image";
}

// 이미지 블록 처리 함수
function processImageBlock(block: NotionBlock, slug?: string): NotionBlock {
  if (!isImageBlock(block)) return block;

  const notionUrl = block.image.external?.url || block.image.file?.url;

  if (
    notionUrl &&
    (notionUrl.includes("amazonaws.com") || notionUrl.includes("notion.so"))
  ) {
    try {
      const s3Url = generateS3Url(notionUrl, slug);
      block.originalImageUrl = notionUrl;

      if (block.image.external?.url) {
        block.image.external.url = s3Url;
      } else if (block.image.file?.url) {
        delete block.image.file;
        block.image.external = { url: s3Url };
      }
    } catch (error) {
      console.error("Error processing image block:", error);
      if (block.image.external?.url) {
        block.image.external.url = IMAGE.fallback;
      } else if (block.image.file?.url) {
        delete block.image.file;
        block.image.external = { url: IMAGE.fallback };
      }
    }
  } else if (!notionUrl) {
    block.image.external = { url: IMAGE.fallback };
  }

  return block;
}

// Notion API 블록을 NotionBlock으로 변환
type NotionApiBlock = NotionBlock & { has_children?: boolean };

// 페이지 블록 가져오기
async function getPageBlocks(
  pageId: string,
  slug?: string,
): Promise<NotionBlock[]> {
  try {
    const blocks: NotionBlock[] = [];
    let cursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      // 각 블록을 처리
      const processedBlocks = response.results.map((block) =>
        processImageBlock(block as NotionApiBlock, slug),
      ) as NotionApiBlock[];

      blocks.push(...processedBlocks);
      cursor = response.has_more
        ? response.next_cursor || undefined
        : undefined;

      for (const block of processedBlocks) {
        if (block.has_children) {
          const childBlocks = await getPageBlocks(block.id, slug);
          (block as NotionBlock & { children?: NotionBlock[] }).children =
            childBlocks;
        }
      }
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error("Error fetching page blocks:", error);
    return [];
  }
}

// 모든 책 목록 가져오기
export async function getBooks(): Promise<string[]> {
  const allPosts = await queryNotionDatabase();

  const bookMap = new Map<string, string>();

  allPosts
    .filter(
      (post) => post.published && post.category === "book" && post.bookTitle,
    )
    .forEach((post) => {
      const currentDate = bookMap.get(post.bookTitle!);
      if (!currentDate || post.date > currentDate) {
        bookMap.set(post.bookTitle!, post.date);
      }
    });

  // 날짜순으로 정렬 (최신순)
  return Array.from(bookMap.entries())
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([bookTitle]) => bookTitle);
}

// 특정 책의 챕터 목록 가져오기 (챕터 번호순 정렬)
export async function getBookChapters(bookName: string): Promise<NotionPost[]> {
  const allPosts = await queryNotionDatabase();
  const chapters = allPosts.filter(
    (post) =>
      post.published &&
      post.category === "book" &&
      post.bookTitle === bookName &&
      post.slug,
  );

  // 챕터 번호순으로 정렬
  return chapters.sort(
    (a, b) => (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999),
  );
}

// 특정 책의 특정 챕터의 메타데이터 가져오기
export async function getBookChapterMetadata(bookName: string, slug: string) {
  return fetchPageMetadata({ type: "book", bookName, slug });
}

// 특정 책의 특정 챕터 가져오기
export async function getBookChapter(bookName: string, slug: string) {
  return fetchPageWithBlocks({ type: "book", bookName, slug });
}

// 모든 책과 챕터 정보를 한 번에 가져오기
export async function getBooksWithChapters(): Promise<
  Array<{
    name: string;
    thumbnail: string;
    description: string;
    chapterCount: number;
  }>
> {
  const allPosts = await queryNotionDatabase();
  const bookChapters = new Map<string, NotionPost[]>();

  // 책별로 챕터 그룹핑
  allPosts
    .filter(
      (post) => post.published && post.category === "book" && post.bookTitle,
    )
    .forEach((post) => {
      const chapters = bookChapters.get(post.bookTitle!) || [];
      chapters.push(post);
      bookChapters.set(post.bookTitle!, chapters);
    });

  // 책별 정보 생성 및 정렬
  return Array.from(bookChapters.entries())
    .map(([bookName, chapters]) => {
      const sortedChapters = chapters.sort(
        (a, b) => (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999),
      );
      return {
        name: bookName,
        thumbnail: sortedChapters[0]?.thumbnail || "",
        description: `${chapters.length}개의 챕터`,
        chapterCount: chapters.length,
        latestDate: Math.max(
          ...chapters.map((c) => new Date(c.date).getTime()),
        ),
      };
    })
    .sort((a, b) => b.latestDate - a.latestDate)
    .map(({ name, thumbnail, description, chapterCount }) => ({
      name,
      thumbnail,
      description,
      chapterCount,
    }));
}
