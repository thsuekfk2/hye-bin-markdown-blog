import { NextResponse } from "next/server";
import { getNotionPosts, getNotionLogs } from "@/lib/notion";

// RSS 피드에 사용될 사이트 기본 정보를 상수로 정의
const SITE_URL = "https://www.hyebin.pro";
const SITE_TITLE = "이혜빈의 개발블로그";
const SITE_DESCRIPTION = "개발을 기록하는 개발블로그입니다.";

// XML에서 특수 의미를 가진 문자들(&, <, >, ", ')을 안전한 엔티티로 변환
// 이렇게 하지 않으면 XML 파싱 오류가 발생 가능성이 있음
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// RSS XML 생성 함수
function generateRssXml(posts: any[]): string {
  const rssItems = posts
    .filter((post) => post.published && post.slug)
    .slice(0, 20)
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const postUrl = `${SITE_URL}/${post.category}/${post.slug}`;

      return `
    <item>
      <title>${escapeXml(post.title || "Untitled")}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <description>${escapeXml(post.description || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category || "post")}</category>
      ${post.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join("\n      ") || ""}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;
}

// 각 글들을 RSS 아이템으로 변환
export async function GET() {
  try {
    const [posts, logs] = await Promise.all([
      getNotionPosts(),
      getNotionLogs(),
    ]);

    // 포스트와 로그를 합쳐서 날짜순으로 정렬
    const allContent = [...posts, ...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const rssXml = generateRssXml(allContent);

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
