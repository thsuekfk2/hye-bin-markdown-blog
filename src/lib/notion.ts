import { Client } from "@notionhq/client";

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
  published: boolean;
  category?: string;
}

function mapNotionPageToPost(page: any): NotionPost {
  return {
    id: page.id,
    title: page.properties["이름"]?.title?.[0]?.plain_text || "Untitled",
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text || "",
    date: page.properties.Date?.date?.start || "",
    description: page.properties.Description?.rich_text?.[0]?.plain_text || "",
    thumbnail:
      page.properties.Thumbnail?.files?.[0]?.file?.url ||
      page.properties.Thumbnail?.files?.[0]?.external?.url ||
      "",
    published: page.properties.Status?.select?.name === "발행" || false,
    category: page.properties.Category?.select?.name || "",
  };
}

// 카테고리별 필터링 함수
function filterByCategory(
  posts: NotionPost[],
  category: "post" | "log",
  limit?: number,
): NotionPost[] {
  const filtered = posts.filter(
    (post) => post.category?.toLowerCase() === category && post.published,
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

async function queryNotionDatabase(): Promise<NotionPost[]> {
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

    return response.results.map(mapNotionPageToPost);
  } catch (error) {
    console.error("Error querying notion database:", error);
    return [];
  }
}

// 데이터베이스에서 로그 목록 가져오기
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

// 데이터베이스에서 포스트 목록 가져오기
export async function getNotionPosts(): Promise<NotionPost[]> {
  const posts = await queryNotionDatabase();
  return filterByCategory(posts, "post");
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

    // 페이지 블록 가져오기
    const blocks = await getPageBlocks(pageId);

    return {
      ...mapNotionPageToPost(page),
      blocks: blocks,
    };
  } catch (error) {
    console.error("Error fetching notion post:", error);
    return null;
  }
}

// 페이지 블록 가져오기 (재귀적으로 모든 블록)
async function getPageBlocks(pageId: string): Promise<any[]> {
  try {
    const blocks = [];
    let cursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      blocks.push(...response.results);
      cursor = response.has_more
        ? response.next_cursor || undefined
        : undefined;

      // 자식 블록이 있는 경우 재귀적으로 가져오기
      for (const block of response.results) {
        if ((block as any).has_children) {
          const childBlocks = await getPageBlocks(block.id);
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
