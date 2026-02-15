import { Card } from "@/components/Card";
import { getBooks, getBookChapters } from "@/lib/notion";
import { ISR_TIME } from "@/lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface BookPageProps {
  params: { bookName: string };
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const bookName = decodeURIComponent(params.bookName);

  return {
    title: `${bookName} | 이혜빈`,
    description: `${bookName} 읽고 정리한 내용`,
  };
}

export const revalidate = ISR_TIME;

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((bookName) => ({
    bookName: encodeURIComponent(bookName),
  }));
}

export default async function BookPage({ params }: BookPageProps) {
  const bookName = decodeURIComponent(params.bookName);
  const chapters = await getBookChapters(bookName);

  if (chapters.length === 0) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col p-4">
      <div className="mb-8">
        <Link href="/books" className="text-sm text-[#999] hover:underline">
          ← 뒤로가기
        </Link>
        <h1 className="mt-4 text-3xl font-bold">{bookName}</h1>
        <p className="mt-2 text-[#999]">총 {chapters.length}개의 챕터</p>
      </div>

      <div className="flex flex-wrap content-start gap-6">
        {chapters.map((chapter, index) => (
          <Card
            key={chapter.slug}
            href={`/books/${encodeURIComponent(bookName)}/${chapter.slug}`}
            thumbnail={chapter.thumbnail}
            description={
              chapter.chapterNumber
                ? `Chapter ${chapter.chapterNumber}`
                : chapter.description || ""
            }
            title={chapter.title}
            index={index}
            tags={chapter.tags || []}
          />
        ))}
      </div>
    </div>
  );
}
