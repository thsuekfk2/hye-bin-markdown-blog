import { ListItem } from "@/components/ListItem";
import { Pagination } from "@/components/Pagination";
import { getNotionLogs } from "@/lib/notion";
import { getRevalidateTime } from "@/lib/config";
import { compareDesc } from "date-fns";

interface LogsPageProps {
  searchParams: { page?: string };
}

export const revalidate = getRevalidateTime('LOGS');

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
    <div className="h-full">
      <header className="flex flex-col justify-center pb-10 text-center">
        <div>TIL</div>
        <div className="text-xs">* Today I Learned.</div>
      </header>
      <div className="flex min-h-[calc(100vh-200px)] w-full flex-col sm:h-[calc(100vh-200px)]">
        <div className="flex w-full flex-1 flex-col overflow-y-auto sm:h-[calc(100%-80px)]">
          {currentLogs.map((log, idx) => (
            <ListItem
              key={idx}
              date={log.slug} // slug를 date로 사용 (250801 형식)
              title={log.title}
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
