import { Client } from "@notionhq/client";
import { cache } from "react";
import { generateS3Url } from "./s3";
import { processImageBlock } from "./notion-image";
import type { NotionBlock } from "@/types/notion";
import type { NotionPost, QueryFilter, BookInfo } from "@/types/post";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const normalizeSpaces = (str: string): string => str.replace(/\u00A0/g, " ");

// plain text 추출
const getTextValue = (prop: any): string =>
  prop?.rich_text?.map((t: any) => t.plain_text).join("") || "";

// 발행된 책 챕터인지 확인
const isPublishedBookChapter = (p: NotionPost): boolean =>
  p.published && p.category === "book" && !!p.bookTitle;

async function mapNotionPageToPost(page: any): Promise<NotionPost> {
  const slug = getTextValue(page.properties.Slug);
  const originalThumbnail =
    page.properties.Thumbnail?.files?.[0]?.external?.url ||
    page.properties.Thumbnail?.files?.[0]?.file?.url ||
    "";

  return {
    id: page.id,
    title:
      page.properties["이름"]?.title?.map((t: any) => t.plain_text).join("") ||
      "Untitled",
    slug,
    date: page.properties.Date?.date?.start || "",
    description: getTextValue(page.properties.Description),
    thumbnail: originalThumbnail.includes("amazonaws.com")
      ? generateS3Url(originalThumbnail, slug)
      : originalThumbnail,
    originalThumbnail,
    published: page.properties.Status?.select?.name === "발행",
    category: page.properties.Category?.select?.name || "",
    tags: page.properties.Tags?.multi_select?.map((t: any) => t.name) || [],
    bookTitle: normalizeSpaces(page.properties.BookTitle?.select?.name || ""),
    chapterNumber: page.properties.ChapterNumber?.number || undefined,
  };
}

type BlockWithChildren = NotionBlock & { has_children?: boolean };

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

      const processedBlocks = response.results.map((block) =>
        processImageBlock(block as BlockWithChildren, slug),
      ) as BlockWithChildren[];

      blocks.push(...processedBlocks);
      cursor = response.has_more
        ? response.next_cursor || undefined
        : undefined;

      for (const block of processedBlocks) {
        if (block.has_children) {
          (block as any).children = await getPageBlocks(block.id, slug);
        }
      }
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error("Error fetching page blocks:", error);
    return [];
  }
}

const queryNotionDatabase = cache(async (): Promise<NotionPost[]> => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      sorts: [{ property: "Date", direction: "descending" }],
    });
    return Promise.all(response.results.map(mapNotionPageToPost));
  } catch (error) {
    console.error("Error querying notion database:", error);
    return [];
  }
});

export async function getArticles(
  category: "post" | "log",
  limit?: number,
): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  const filtered = posts.filter(
    (p) => p.category === category && p.published && p.slug,
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

export const getNotionPosts = () => getArticles("post");
export const getNotionLogs = () => getArticles("log");
export const getRecentPosts = (limit = 4) => getArticles("post", limit);
export const getRecentLogs = (limit = 4) => getArticles("log", limit);

export async function getAllTags(): Promise<string[]> {
  const posts = await queryNotionDatabase();
  const tags = posts
    .filter((p) => p.published && p.slug)
    .flatMap((p) => p.tags || []);
  return Array.from(new Set(tags)).sort();
}

export async function getPostsByTag(tag: string): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return posts.filter((p) => p.published && p.slug && p.tags?.includes(tag));
}

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

async function fetchPage(
  filter: QueryFilter,
  withBlocks: boolean,
): Promise<(NotionPost & { blocks?: NotionBlock[] }) | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: buildQueryFilter(filter),
    });

    if (response.results.length === 0) return null;

    const page = response.results[0] as any;
    const post = await mapNotionPageToPost(page);

    if (!withBlocks) return post;

    const slug = getTextValue(page.properties.Slug) || filter.slug;
    const blocks = await getPageBlocks(page.id, slug);

    return { ...post, blocks };
  } catch (error) {
    console.error("Error fetching page:", { filter, error });
    return null;
  }
}

export const getNotionPost = (slug: string) =>
  fetchPage({ type: "post", slug }, true);

export const getNotionPostMetadata = (slug: string) =>
  fetchPage({ type: "post", slug }, false);

export const getBookChapter = (bookName: string, slug: string) =>
  fetchPage({ type: "book", bookName, slug }, true);

export const getBookChapterMetadata = (bookName: string, slug: string) =>
  fetchPage({ type: "book", bookName, slug }, false);

export async function getBookChapters(bookName: string): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return posts
    .filter(
      (p) => isPublishedBookChapter(p) && p.bookTitle === bookName && p.slug,
    )
    .sort((a, b) => (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999));
}

export async function getBooksWithChapters(): Promise<BookInfo[]> {
  const posts = await queryNotionDatabase();
  const bookMap = new Map<string, NotionPost[]>();

  posts.filter(isPublishedBookChapter).forEach((p) => {
    const chapters = bookMap.get(p.bookTitle!) || [];
    chapters.push(p);
    bookMap.set(p.bookTitle!, chapters);
  });

  return Array.from(bookMap.entries())
    .map(([name, chapters]) => {
      const sorted = chapters.sort(
        (a: NotionPost, b: NotionPost) =>
          (a.chapterNumber ?? 999) - (b.chapterNumber ?? 999),
      );
      return {
        name,
        thumbnail: sorted[0]?.thumbnail || "",
        description: `${chapters.length}개의 챕터`,
        chapterCount: chapters.length,
        latestDate: Math.max(
          ...chapters.map((c: NotionPost) => new Date(c.date).getTime()),
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

export async function getBooks(): Promise<string[]> {
  const books = await getBooksWithChapters();
  return books.map((b) => b.name);
}
