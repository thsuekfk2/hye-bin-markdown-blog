"use client";

import { ListItem } from "@/components/ListItem";
import { Pagination } from "@/components/Pagination";
import { allLogs } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function LogsPage() {
  const LOGS_PER_PAGE = 11;

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const getSortedLogs = () => {
    return allLogs.sort((a, b) =>
      compareDesc(new Date(a.date), new Date(b.date)),
    );
  };

  const sortedLogs = getSortedLogs();
  const pageCount = Math.ceil(sortedLogs.length / LOGS_PER_PAGE);
  const currentLogs = sortedLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE,
  );

  return (
    <div className="h-full">
      <header className="flex flex-col justify-center pb-10 text-center">
        <div>개발 로그</div>
        <div className="text-xs">하루하루 공부한 내용을 기록합니다.</div>
      </header>
      <div className="flex h-[70vh] max-h-[800px] w-full flex-col justify-between">
        <div className="flex min-h-[500px] w-full flex-col">
          {currentLogs.map((post, idx) => (
            <ListItem
              key={idx}
              date={post._raw.sourceFileName.split(".")[0]}
              title={post.title}
            />
          ))}
        </div>
        <Pagination
          route="log"
          pageCount={pageCount}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
