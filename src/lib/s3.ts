import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * 이미지 URL에서 파일 확장자 추출
 */
function getFileExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * URL을 정규화하여 토큰 파라미터 제거
 */
function normalizeNotionUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // AWS S3 URL에서 토큰 관련 파라미터 제거
    urlObj.searchParams.delete("X-Amz-Algorithm");
    urlObj.searchParams.delete("X-Amz-Credential");
    urlObj.searchParams.delete("X-Amz-Date");
    urlObj.searchParams.delete("X-Amz-Expires");
    urlObj.searchParams.delete("X-Amz-Signature");
    urlObj.searchParams.delete("X-Amz-SignedHeaders");
    urlObj.searchParams.delete("X-Amz-Security-Token");

    // 파일 경로만 사용 (토큰 없이)
    return urlObj.protocol + "//" + urlObj.host + urlObj.pathname;
  } catch {
    return url;
  }
}

/**
 * URL 해시로 고유한 파일명 생성
 */
function generateFileName(notionUrl: string, slug?: string): string {
  const normalizedUrl = normalizeNotionUrl(notionUrl);
  const hash = crypto.createHash("md5").update(normalizedUrl).digest("hex");
  const ext = getFileExtension(notionUrl);

  if (slug) {
    return `notion-images/${slug}/${hash}.${ext}`;
  }

  return `notion-images/shared/${hash}.${ext}`;
}

/**
 * S3에 파일이 이미 존재하는지 확인
 */
async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * S3 URL만 생성 (업로드는 런타임에 지연 처리)
 */
export function generateS3Url(notionUrl: string, slug?: string): string {
  // S3 설정이 없으면 fallback
  if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
    return "/jump.webp";
  }

  const fileName = generateFileName(notionUrl, slug);
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function uploadNotionImageToS3(
  notionImageUrl: string,
  slug?: string,
): Promise<string> {
  // S3 설정이 없으면 fallback
  if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
    console.warn("S3 configuration missing, using fallback");
    return "/jump.webp";
  }

  try {
    const fileName = generateFileName(notionImageUrl, slug);

    // S3에 파일이 이미 존재하는지 확인
    const exists = await fileExists(fileName);
    if (exists) {
      console.log(`Using cached S3 file: ${fileName}`);
      return generateS3Url(notionImageUrl, slug);
    }

    console.log(`Uploading image to S3: ${fileName}`);

    // Notion에서 이미지 다운로드
    const response = await fetch(notionImageUrl);
    if (!response.ok) {
      console.error(
        `Failed to fetch image: ${response.status} for URL: ${notionImageUrl}`,
      );

      // 403/404 에러의 경우 fallback 이미지 사용
      if (response.status === 403 || response.status === 404) {
        console.warn("Image URL expired, using fallback image");
        return "/jump.webp";
      }

      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // S3에 업로드
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(imageBuffer),
        ContentType: contentType,
        CacheControl: "max-age=31536000", // 1년 캐시
      }),
    );

    return generateS3Url(notionImageUrl, slug);
  } catch (error) {
    console.error("Error uploading image to S3:", error);

    // 네트워크 에러나 기타 실패 시에도 fallback 이미지 사용
    if (error instanceof Error && error.message.includes("403")) {
      return "/jump.webp";
    }

    return "/jump.webp"; // 모든 실패 시 fallback 이미지
  }
}
