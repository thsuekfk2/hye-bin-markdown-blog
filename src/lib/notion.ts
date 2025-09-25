import { Client } from "@notionhq/client";
import { cache } from "react";
import { generateS3Url } from "./s3";

// Notion 공식 API 클라이언트
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
  tags?: string[]; // 태그 배열
  blocks?: any[]; // 블록 데이터는 getNotionPost에서만 사용됨
}

async function mapNotionPageToPost(page: any): Promise<NotionPost> {
  const slug = page.properties.Slug?.rich_text?.[0]?.plain_text || "";
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
    title: page.properties["이름"]?.title?.[0]?.plain_text || "Untitled",
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text || "",
    date: page.properties.Date?.date?.start || "",
    description: page.properties.Description?.rich_text?.[0]?.plain_text || "",
    thumbnail,
    originalThumbnail,
    published: page.properties.Status?.select?.name === "발행" || false,
    category: page.properties.Category?.select?.name || "",
    tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
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

// 메타데이터용 포스트 정보만 가져오기
export async function getNotionPostMetadata(slug: string) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0] as any;
    return await mapNotionPageToPost(page);
  } catch (error) {
    console.error("Error fetching notion post metadata:", error);
    return null;
  }
}

// 특정 포스트 가져오기
export async function getNotionPost(slug: string) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0] as any;
    const pageId = page.id;
    const pageSlug = page.properties.Slug?.rich_text?.[0]?.plain_text || slug;

    // 페이지 블록 가져오기
    const blocks = await getPageBlocks(pageId, pageSlug);

    const post = await mapNotionPageToPost(page);
    return {
      ...post,
      blocks: blocks,
    };
  } catch (error) {
    console.error("Error fetching notion post:", error);
    return null;
  }
}

// 이미지 블록 처리 함수
async function processImageBlock(block: any, slug?: string): Promise<any> {
  if (block.type === "image" && block.image) {
    const notionUrl = block.image.external?.url || block.image.file?.url;

    if (
      notionUrl &&
      (notionUrl.includes("amazonaws.com") || notionUrl.includes("notion.so"))
    ) {
      try {
        // S3 URL 직접 생성
        const s3Url = generateS3Url(notionUrl, slug);

        // 원본 URL을 보존
        (block as any).originalImageUrl = notionUrl;

        // S3 URL로 교체
        if (block.image.external?.url) {
          block.image.external.url = s3Url;
        } else if (block.image.file?.url) {
          delete block.image.file;
          block.image.external = { url: s3Url };
        }
      } catch (error) {
        console.error("Error processing image block:", error);
        // fallback 이미지로 교체
        if (block.image.external?.url) {
          block.image.external.url = "/jump.webp";
        } else if (block.image.file?.url) {
          delete block.image.file;
          block.image.external = { url: "/jump.webp" };
        }
      }
    } else if (!notionUrl) {
      block.image.external = { url: "/jump.webp" };
    }
  }
  return block;
}

// 페이지 블록 가져오기 (재귀적으로 모든 블록)
async function getPageBlocks(pageId: string, slug?: string): Promise<any[]> {
  try {
    const blocks = [];
    let cursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      // 각 블록을 처리
      const processedBlocks = await Promise.all(
        response.results.map((block) => processImageBlock(block, slug)),
      );

      blocks.push(...processedBlocks);
      cursor = response.has_more
        ? response.next_cursor || undefined
        : undefined;

      // 자식 블록이 있는 경우 재귀적으로 가져오기
      for (const block of processedBlocks) {
        if ((block as any).has_children) {
          const childBlocks = await getPageBlocks(block.id, slug);
          (block as any).children = childBlocks;
        }
      }
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error("Error fetching page blocks:", error);
    return [];
  }
}
