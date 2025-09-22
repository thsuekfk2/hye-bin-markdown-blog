import { ListItem } from "@/components/ListItem";
import { Pagination } from "@/components/Pagination";
import { getNotionLogs } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";
import { compareDesc } from "date-fns";

interface LogsPageProps {
  searchParams: { page?: string };
}

export const revalidate = ISR_TIME;

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const LOGS_PER_PAGE = 11;

  const currentPage = parseInt(searchParams.page || "1", 10);

  // 노션에서 로그 데이터 가져오기 (ISR 사용)
  const allLogs = await getNotionLogs();

  const sortedLogs = allLogs.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  );

  const pageCount = Math.ceil(sortedLogs.length / LOGS_PER_PAGE);
  const currentLogs = sortedLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE,
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-[60px] flex-col justify-center text-center">
        TIL
      </div>
      <div className="flex flex-col sm:h-[calc(100vh-170px)]">
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          {currentLogs.map((log, idx) => (
            <ListItem
              key={`${currentPage}-${idx}`}
              date={log.slug}
              title={log.title}
              index={idx}
            />
          ))}
        </div>
        <div className="flex h-[80px] flex-shrink-0 items-center justify-center">
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
