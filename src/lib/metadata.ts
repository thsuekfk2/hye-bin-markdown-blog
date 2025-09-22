import { Metadata } from "next";
import { NotionPost } from "./notion";

interface GenerateMetadataOptions {
  article: NotionPost | null;
  type: "post" | "log";
  slug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function generateArticleMetadata({
  article,
  type,
  slug,
  fallbackTitle = "Article Not Found",
  fallbackDescription = "이혜빈의 개발블로그",
}: GenerateMetadataOptions): Metadata {
  if (!article) {
    return {
      title: fallbackTitle,
    };
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${type}/${slug}`;
  const description = article.description || fallbackDescription;

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      locale: "ko",
      url,
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.thumbnail ? [article.thumbnail] : [],
    },
  };
}