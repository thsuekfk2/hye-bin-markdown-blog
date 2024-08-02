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
        <div className="text-xs">소중한 경험을 기록합니다.</div>
      </div>
      <div className="flex h-[70vh] max-h-[800px] flex-col justify-between">
        <div className="flex min-h-[500px] flex-wrap justify-center gap-6">
          {currentLogs.map((post, key) => (
            <Card
              key={key}
              href={`post/${post._raw.sourceFileName.split(".")[0]}`}
              thumbnail={post.thumbnail ?? ""}
              description={post.description}
              title={post.title}
            />
          ))}
        </div>
        <Pagination
          route="post"
          pageCount={pageCount}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
