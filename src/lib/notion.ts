import { Client } from "@notionhq/client";
import { cache } from "react";
import { generateS3Url } from "./s3";

// Notion 공식 API 클라이언트
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
  blocks?: any[];
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
  const slug = page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") || "";
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
    title: page.properties["이름"]?.title?.map((t: any) => t.plain_text).join("") || "Untitled",
    slug: page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") || "",
    date: page.properties.Date?.date?.start || "",
    description: page.properties.Description?.rich_text?.map((t: any) => t.plain_text).join("") || "",
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
    const pageSlug = page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") || slug;

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
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: "Category",
            select: {
              equals: "book",
            },
          },
          {
            property: "BookTitle",
            select: {
              equals: bookName,
            },
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0] as any;
    return await mapNotionPageToPost(page);
  } catch (error) {
    console.error("Error fetching book chapter metadata:", {
      bookName,
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// 특정 책의 특정 챕터 가져오기
export async function getBookChapter(bookName: string, slug: string) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: "Category",
            select: {
              equals: "book",
            },
          },
          {
            property: "BookTitle",
            select: {
              equals: bookName,
            },
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0] as any;
    const pageId = page.id;
    const pageSlug = page.properties.Slug?.rich_text?.map((t: any) => t.plain_text).join("") || slug;

    // 페이지 블록 가져오기
    const blocks = await getPageBlocks(pageId, pageSlug);

    const post = await mapNotionPageToPost(page);
    return {
      ...post,
      blocks: blocks,
    };
  } catch (error) {
    console.error("Error fetching book chapter:", {
      bookName,
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
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
