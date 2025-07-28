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
        <div>TIL</div>
        <div className="text-xs">* Today I Learned.</div>
      </header>
      <div className="flex min-h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)] w-full flex-col">
        <div className="flex flex-1 sm:h-[calc(100%-80px)] w-full flex-col overflow-y-auto">
          {currentLogs.map((post, idx) => (
            <ListItem
              key={idx}
              date={post._raw.sourceFileName.split(".")[0]}
              title={post.title}
            />
          ))}
        </div>
        <div className="flex h-[80px] items-center justify-center flex-shrink-0">
          <Pagination
            route="log"
            pageCount={pageCount}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
