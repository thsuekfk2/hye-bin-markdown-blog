const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

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

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = "hyebin-markdown-blog";
const S3_BASE_URL = `https://${S3_BUCKET}.s3.ap-northeast-2.amazonaws.com`;

// 노션 데이터베이스 ID (환경변수에서 설정)
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
// 콘텐츠 디렉토리 경로
const CONTENTS_DIR = path.join(process.cwd(), "contents");
// 해시 캐시 파일 경로
const HASH_CACHE_FILE = path.join(process.cwd(), ".sync-cache.json");

// 해시 캐시 로드
function loadHashCache() {
  if (fs.existsSync(HASH_CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HASH_CACHE_FILE, "utf8"));
    } catch (error) {
      console.warn("해시 캐시 파일 로드 실패, 새로 생성합니다.");
      return {};
    }
  }
  return {};
}

// 해시 캐시 저장
function saveHashCache(cache) {
  fs.writeFileSync(HASH_CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function syncNotionToMDX() {
  try {
    console.log("🚀 노션에서 데이터를 가져오는 중...");

    // 해시 캐시 로드
    const hashCache = loadHashCache();

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
      await processPage(page, hashCache);
    }

    // 해시 캐시 저장
    saveHashCache(hashCache);

    console.log("동기화가 완료되었습니다!");
  } catch (error) {
    console.error("동기화 중 오류가 발생했습니다:", error);
  }
}

async function processPage(page, hashCache) {
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
    // 필수 필드 확인
    if (!title || !slug || !date) {
      console.log(
        `⚠️  건너뛰기: "${title}" - 필수 필드 누락 (제목: ${!!title}, 슬러그: ${!!slug}, 날짜: ${!!date})`,
      );
      return;
    }

    // 마크다운 변환 및 이미지 처리
    const mdblocks = await n2m.pageToMarkdown(page.id);
    
    // 이미지 URL을 S3 URL로 변환
    await processImagesInBlocks(mdblocks, category, slug);
    
    const mdString = n2m.toMarkdownString(mdblocks);

    // frontmatter 생성
    const frontmatter = createFrontmatter({
      title,
      slug,
      date,
      description,
      thumbnail,
      tags,
    });

    // 최종 MDX 내용 (불필요한 줄바꿈 제거)
    let cleanedMarkdown = mdString.parent
      // 3개 이상의 연속 줄바꿈을 2개로 줄임
      .replace(/\n\n\n+/g, "\n\n")
      // 테이블 행 사이의 불필요한 줄바꿈 제거
      .replace(/\|\s*\n\s*\n\s*\|/g, "|\n|")
      // 콜아웃 내부의 불필요한 줄바꿈 제거
      .replace(/(> .*)\n\s*\n\s*(> )/g, "$1\n$2")
      // 콜아웃과 다음 내용 사이의 과도한 줄바꿈 정리
      .replace(/(> .*)\n\s*\n\s*\n+/g, "$1\n\n")
      .trim();
    const mdxContent = `${frontmatter}\n\n${cleanedMarkdown}`;

    // 파일 경로 결정
    const filePath = getFilePath(category, slug, date);

    // 새로운 내용의 해시 생성
    const newContentHash = crypto
      .createHash("md5")
      .update(mdxContent)
      .digest("hex");

    // 캐시된 해시와 비교 (파일이 존재하는 경우)
    if (fs.existsSync(filePath)) {
      const fileStats = fs.statSync(filePath);
      const cacheKey = filePath;
      const cachedData = hashCache[cacheKey];
      
      // 캐시 데이터 구조: { hash, size, mtime }
      const newSize = Buffer.byteLength(mdxContent, 'utf8');
      
      // 캐시된 데이터가 있고, 크기가 같고, 해시도 같으면 건너뛰기
      if (cachedData && 
          cachedData.size === newSize && 
          cachedData.hash === newContentHash) {
        console.log(`⏭️  변경사항 없음: "${title}" - 건너뛰기`);
        return;
      }
      
      // 캐시된 데이터가 없거나 크기가 다르면 파일을 읽어서 확인
      if (!cachedData || cachedData.size !== newSize) {
        const existingContent = fs.readFileSync(filePath, "utf8");
        const existingContentHash = crypto
          .createHash("md5")
          .update(existingContent)
          .digest("hex");

        if (existingContentHash === newContentHash) {
          console.log(`⏭️  변경사항 없음: "${title}" - 건너뛰기`);
          // 캐시에 저장 (해시, 크기, 수정시간)
          hashCache[cacheKey] = {
            hash: newContentHash,
            size: newSize,
            mtime: fileStats.mtime.getTime()
          };
          return;
        }
      }
    }

    // 디렉토리 생성
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 파일 쓰기
    fs.writeFileSync(filePath, mdxContent, "utf8");
    
    // 캐시에 새 데이터 저장
    const fileStats = fs.statSync(filePath);
    hashCache[filePath] = {
      hash: newContentHash,
      size: Buffer.byteLength(mdxContent, 'utf8'),
      mtime: fileStats.mtime.getTime()
    };
    
    console.log(`✅ 업데이트됨: ${filePath}`);
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

// S3 이미지 처리 함수들
async function processImagesInBlocks(blocks, category, slug) {
  let imageCounter = 1;
  
  for (const block of blocks) {
    if (block.type === 'image') {
      const originalUrl = block.parent;
      if (originalUrl && (originalUrl.includes('notion.so') || originalUrl.includes('prod-files-secure'))) {
        try {
          console.log(`   📸 이미지 처리 중: ${imageCounter}.jpg`);
          
          const s3Key = `${category}/${slug}/${imageCounter}.jpg`;
          const s3Url = `${S3_BASE_URL}/${s3Key}`;
          
          // S3에 이미 존재하는지 확인
          const exists = await checkS3ObjectExists(s3Key);
          if (exists) {
            console.log(`   ♻️  이미지 재사용: ${s3Key} (이미 존재함)`);
            block.parent = s3Url;
          } else {
            // 이미지 다운로드 및 S3 업로드
            const imageBuffer = await downloadImage(originalUrl);
            await uploadToS3(imageBuffer, s3Key);
            
            console.log(`   ✅ S3 업로드 완료: ${s3Url}`);
            block.parent = s3Url;
          }
          
          imageCounter++;
        } catch (error) {
          console.error(`   ❌ 이미지 처리 실패:`, error.message);
        }
      }
    }
  }
}

async function checkS3ObjectExists(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function uploadToS3(buffer, key) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
}

// 스크립트 실행
if (require.main === module) {
  syncNotionToMDX();
}

module.exports = { syncNotionToMDX };
