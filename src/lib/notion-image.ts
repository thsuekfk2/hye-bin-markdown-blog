import { generateS3Url } from "./s3";
import { IMAGE } from "./constants";
import type { NotionBlock, ImageBlock } from "@/types/notion";

function isImageBlock(block: NotionBlock): block is ImageBlock {
  return block.type === "image";
}

export function processImageBlock(
  block: NotionBlock,
  slug?: string,
): NotionBlock {
  if (!isImageBlock(block)) return block;

  const notionUrl = block.image.external?.url || block.image.file?.url;

  if (!notionUrl) {
    block.image.external = { url: IMAGE.fallback };
    return block;
  }

  const needsS3 =
    notionUrl.includes("amazonaws.com") || notionUrl.includes("notion.so");

  if (needsS3) {
    try {
      const s3Url = generateS3Url(notionUrl, slug);
      block.originalImageUrl = notionUrl;

      if (block.image.file?.url) {
        delete block.image.file;
      }
      block.image.external = { url: s3Url };
    } catch {
      block.image.external = { url: IMAGE.fallback };
    }
  }

  return block;
}
