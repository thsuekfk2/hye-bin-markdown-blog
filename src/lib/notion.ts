import { Client } from "@notionhq/client";
import { cache } from "react";
import { generateS3Url } from "./s3";
import { processImageBlock } from "./notion-image";
import type { NotionBlock } from "@/types/notion";
import type { NotionPost, QueryFilter } from "@/types/post";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const getTextValue = (prop: any): string =>
  prop?.rich_text?.map((t: any) => t.plain_text).join("") || "";

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

async function fetchPage(
  filter: QueryFilter,
  withBlocks: boolean,
): Promise<(NotionPost & { blocks?: NotionBlock[] }) | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { property: "Slug", rich_text: { equals: filter.slug } },
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
