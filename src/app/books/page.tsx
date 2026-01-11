import { Card } from "@/components/Card";
import { getBooksWithChapters } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "책 | 이혜빈",
  description: "읽고 정리한 책들",
};

export const revalidate = ISR_TIME;

export default async function BooksPage() {
  const booksWithInfo = await getBooksWithChapters();

  return (
    <div className="flex w-full flex-col p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">BOOKS</h1>
      </div>

      <div className="flex flex-wrap content-start gap-6">
        {booksWithInfo.map((book, index) => (
          <Card
            key={book.name}
            href={`/books/${encodeURIComponent(book.name)}`}
            thumbnail={book.thumbnail}
            description={book.description}
            title={book.name}
            index={index}
            tags={[]}
          />
        ))}
      </div>

      {booksWithInfo.length === 0 && (
        <div className="flex h-64 items-center justify-center text-[#999]">
          아직 등록된 책이 없습니다.
        </div>
      )}
    </div>
  );
}
