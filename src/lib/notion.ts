import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { cache } from "react";
import GithubSlugger from "github-slugger";
import { codeToHtml } from "shiki";
import { generateS3Url, uploadNotionImageToS3 } from "./s3";
import { IMAGE } from "./constants";
import type { NotionPost, QueryFilter, TocItem } from "@/types/post";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const toPlainText = (richText: any[] | undefined): string =>
  (richText ?? []).map((t: any) => t.plain_text).join("");

const getTextValue = (prop: any): string => toPlainText(prop?.rich_text);

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

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

async function getPageMarkdown(
  pageId: string,
  slug: string,
): Promise<{ markdown: string; headings: TocItem[] }> {
  const n2m = new NotionToMarkdown({ notionClient: notion });

  n2m.setCustomTransformer("image", async (block: any) => {
    const notionUrl = block.image?.external?.url || block.image?.file?.url;
    if (!notionUrl) return `![](${IMAGE.fallback})`;
    const needsS3 =
      notionUrl.includes("amazonaws.com") || notionUrl.includes("notion.so");
    const url = needsS3 ? await uploadNotionImageToS3(notionUrl, slug) : notionUrl;
    const caption = toPlainText(block.image?.caption);
    return `![${caption}](${url})`;
  });

  n2m.setCustomTransformer("callout", async (block: any) => {
    const icon = block.callout?.icon?.emoji || "💡";
    const richText = toPlainText(block.callout?.rich_text);

    let childrenMd = "";
    if (block.has_children) {
      const childBlocks = await n2m.pageToMarkdown(block.id);
      childrenMd = n2m.toMarkdownString(childBlocks).parent.trim();
    }

    const content = [richText, childrenMd].filter(Boolean).join("\n\n");
    if (!content) return `> [!${icon}]\n>`;

    const quotedContent = content
      .split("\n")
      .map((line: string) => `> ${line}`)
      .join("\n");

    return `> [!${icon}]\n>\n${quotedContent}`;
  });

  n2m.setCustomTransformer("code", async (block: any) => {
    const code = toPlainText(block.code?.rich_text);
    const rawLang = block.code?.language || "text";
    const langMap: Record<string, string> = {
      "plain text": "text",
      shell: "bash",
    };
    const lang = langMap[rawLang.toLowerCase()] ?? rawLang.toLowerCase();
    try {
      return await codeToHtml(code, { lang, theme: "dark-plus" });
    } catch {
      return await codeToHtml(code, { lang: "text", theme: "dark-plus" });
    }
  });

  n2m.setCustomTransformer("table_of_contents", async () => "");

  n2m.setCustomTransformer("column_list", async (block: any) => {
    if (!block.has_children) return "";
    const cols = await n2m.pageToMarkdown(block.id);
    const parts = cols.map((col) => {
      const md = n2m.toMarkdownString(col.children).parent;
      const html = md.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" data-column="true" style="width:100%;height:auto;border-radius:8px">',
      );
      return `<div style="flex:1;min-width:0">${html}</div>`;
    });
    return `<div style="display:flex;gap:24px;margin-bottom:24px;align-items:flex-start">${parts.join("")}</div>`;
  });

  const mdBlocks = await n2m.pageToMarkdown(pageId);

  const slugger = new GithubSlugger();
  const headings: TocItem[] = mdBlocks
    .filter((b) =>
      ["heading_1", "heading_2", "heading_3"].includes(b.type as string),
    )
    .map((b) => {
      const raw = b.parent.replace(/^#+\s/, "");
      const text = stripMarkdownFormatting(raw);
      return {
        text,
        level: parseInt((b.type as string).split("_")[1]),
        slug: slugger.slug(text),
      };
    });

  const { parent: markdown } = n2m.toMarkdownString(mdBlocks);

  return { markdown, headings };
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
  withContent: boolean,
): Promise<NotionPost | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { property: "Slug", rich_text: { equals: filter.slug } },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0] as any;
    const post = await mapNotionPageToPost(page);

    if (!withContent) return post;

    const { markdown, headings } = await getPageMarkdown(
      page.id,
      post.slug || filter.slug,
    );

    return { ...post, markdown, headings };
  } catch (error) {
    console.error("Error fetching page:", { filter, error });
    return null;
  }
}

export const getNotionPost = (slug: string) =>
  fetchPage({ type: "post", slug }, true);

export const getNotionPostMetadata = (slug: string) =>
  fetchPage({ type: "post", slug }, false);
