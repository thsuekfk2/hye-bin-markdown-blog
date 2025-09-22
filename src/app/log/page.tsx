import { ListItem } from "@/components/ListItem";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionLogs } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";

interface LogsPageProps {
  searchParams: { page?: string };
}

export const revalidate = ISR_TIME;

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const LOGS_PER_PAGE = 11;
  const currentPage = parseInt(searchParams.page || "1", 10);

  const logs = await getNotionLogs();
  const pageCount = Math.ceil(logs.length / LOGS_PER_PAGE);
  const currentLogs = logs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE,
  );

  return (
    <PaginatedLayout
      title="TIL"
      currentPage={currentPage}
      pageCount={pageCount}
      route="log"
    >
      <div className="flex flex-col px-4 py-2">
        {currentLogs.map((log, idx) => (
          <ListItem
            key={`${currentPage}-${idx}`}
            slug={log.slug}
            title={log.title}
            index={idx}
          />
        ))}
      </div>
    </PaginatedLayout>
  );
}
