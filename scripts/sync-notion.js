const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");

// 환경변수 수동 로드
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

// 환경변수에서 설정 읽기
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({
  notionClient: notion,
  config: {
    parseChildPages: false,
    convertImagesToBase64: false,
  },
});

// 노션 데이터베이스 ID (환경변수에서 설정)
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
// 콘텐츠 디렉토리 경로
const CONTENTS_DIR = path.join(process.cwd(), "contents");

async function syncNotionToMDX() {
  try {
    console.log("🚀 노션에서 데이터를 가져오는 중...");

    // 노션 데이터베이스에서 모든 글 가져오기 (테스트용)
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "이름",
          direction: "descending",
        },
      ],
    });

    console.log(`📝 ${response.results.length}개의 글을 찾았습니다.`);

    for (const page of response.results) {
      await processPage(page);
    }

    console.log("동기화가 완료되었습니다!");
  } catch (error) {
    console.error("동기화 중 오류가 발생했습니다:", error);
  }
}

async function processPage(page) {
  try {
    // 페이지 속성 추출
    const properties = page.properties;

    console.log("사용 가능한 속성들:", Object.keys(properties));

    // 실제 속성에서 값 추출 (영문 속성명 기준)
    const title =
      properties["이름"]?.title?.[0]?.plain_text ||
      properties["Title"]?.rich_text?.[0]?.plain_text ||
      "";
    const slug = properties["Slug"]?.rich_text?.[0]?.plain_text || "";
    const category = properties["Category"]?.select?.name || "post";
    const date = properties["Date"]?.date?.start || "";
    const description =
      properties["Description"]?.rich_text?.[0]?.plain_text || "";
    const tags = properties["Tags"]?.multi_select?.map((tag) => tag.name) || [];
    const thumbnail =
      properties["Thumbnail"]?.files?.[0]?.file?.url ||
      properties["Thumbnail"]?.files?.[0]?.external?.url ||
      "";
    const lastEditedTime = page.last_edited_time;

    // 필수 필드 확인
    if (!title || !slug || !date) {
      console.log(
        `⚠️  건너뛰기: "${title}" - 필수 필드 누락 (제목: ${!!title}, 슬러그: ${!!slug}, 날짜: ${!!date})`,
      );
      return;
    }

    // 마크다운 변환
    const mdblocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdblocks);

    // 파일 경로 결정
    const filePath = getFilePath(category, slug, date);

    // 기존 파일이 있는지 확인하고 수정 날짜 비교
    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath, "utf8");
      const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const existingLastEdited = frontmatterMatch[1].match(
          /lastEditedTime: "([^"]+)"/,
        );

        if (existingLastEdited && existingLastEdited[1] === lastEditedTime) {
          console.log(`⏭️  변경사항 없음: "${title}" - 건너뛰기`);
          return;
        }
      }
    }

    // frontmatter 생성 (lastEditedTime 포함)
    const frontmatter = createFrontmatter({
      title,
      slug,
      date,
      description,
      thumbnail,
      tags,
      lastEditedTime,
    });

    // 최종 MDX 내용
    const cleanedMarkdown = mdString.parent.replace(/\n\n\n+/g, "\n\n").trim();
    const mdxContent = `${frontmatter}\n\n${cleanedMarkdown}`;

    // 디렉토리 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 파일 쓰기
    fs.writeFileSync(filePath, mdxContent, "utf8");
    console.log(`업데이트됨: ${filePath}`);
  } catch (error) {
    console.error(`페이지 처리 실패 (${page.id}):`, error);
  }
}

function createFrontmatter({
  title,
  slug,
  date,
  description,
  thumbnail,
  tags,
  lastEditedTime,
}) {
  const tagList =
    tags.length > 0 ? tags.map((tag) => `"${tag}"`).join(", ") : "";

  return `---
title: "${title}"
slug: "${slug}"
date: "${date}"
description: "${description}"
thumbnail: "${thumbnail}"
tags: ${tags.length > 0 ? `[${tagList}]` : `[]`}
lastEditedTime: ${lastEditedTime ? `${lastEditedTime}` : ""}
---`;
}

function getFilePath(category, slug, date) {
  if (category === "log") {
    // 로그는 날짜 기반 폴더 구조
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString().slice(-2); // 24
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 03
    const day = String(dateObj.getDate()).padStart(2, "0"); // 15

    const folderName = `${year}${month}`; // 2403
    const fileName = `${year}${month}${day}.mdx`; // 240315.mdx

    return path.join(CONTENTS_DIR, "log", folderName, fileName);
  } else {
    // 포스트는 슬러그 기반
    return path.join(CONTENTS_DIR, "post", `${slug}.mdx`);
  }
}

// 스크립트 실행
if (require.main === module) {
  syncNotionToMDX();
}

module.exports = { syncNotionToMDX };
