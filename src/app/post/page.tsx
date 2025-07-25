"use client";

import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function page() {
  const LOGS_PER_PAGE = 4;

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const getSortedPosts = () => {
    return allPosts.sort((a, b) =>
      compareDesc(new Date(a.date), new Date(b.date)),
    );
  };

  const sortedLogs = getSortedPosts();
  const pageCount = Math.ceil(sortedLogs.length / LOGS_PER_PAGE);
  const currentLogs = sortedLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE,
  );

  return (
    <div className="h-full w-full items-center justify-center">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>기록</div>
      </div>
      <div className="flex min-h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)] flex-col">
        <div className="flex flex-1 sm:h-[calc(100%-80px)] flex-wrap justify-center gap-6 content-start overflow-y-auto">
          {currentLogs.map((post, key) => (
            <Card
              key={key}
              href={`post/${post.slug}`}
              thumbnail={post.thumbnail ?? ""}
              description={post.description}
              title={post.title}
            />
          ))}
        </div>
        <div className="flex h-[80px] items-center justify-center flex-shrink-0">
          <Pagination
            route="post"
            pageCount={pageCount}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
