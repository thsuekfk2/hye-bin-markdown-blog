import {
  getBooks,
  getBookChapter,
  getBookChapters,
  getBookChapterMetadata,
} from "@/lib/notion";
import { ArticleLayout } from "@/components/ArticleLayout";
import { generateArticleMetadata } from "@/lib/metadata";
import { ISR_TIME } from "@/lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ChapterPageProps {
  params: { bookName: string; slug: string };
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const bookName = decodeURIComponent(params.bookName);
  const decodedSlug = decodeURIComponent(params.slug);
  const chapter = await getBookChapterMetadata(bookName, decodedSlug);

  return generateArticleMetadata({
    article: chapter,
    type: "book",
    slug: params.slug,
    fallbackTitle: "Chapter Not Found",
    fallbackDescription: "이혜빈의 개발블로그",
  });
}

export const revalidate = ISR_TIME;

export async function generateStaticParams() {
  const books = await getBooks();
  const allParams: { bookName: string; slug: string }[] = [];

  for (const bookName of books) {
    const chapters = await getBookChapters(bookName);
    for (const chapter of chapters) {
      allParams.push({
        bookName: encodeURIComponent(bookName),
        slug: chapter.slug,
      });
    }
  }

  return allParams;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const bookName = decodeURIComponent(params.bookName);
  const decodedSlug = decodeURIComponent(params.slug);
  const chapter = await getBookChapter(bookName, decodedSlug);

  if (!chapter) {
    notFound();
  }

  const chapters = await getBookChapters(bookName);

  return <ArticleLayout article={chapter} articles={chapters} type="book" />;
}
