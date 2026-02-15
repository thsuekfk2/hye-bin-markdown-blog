import { ListItem } from "@/components/ListItem";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionLogs } from "@/lib/notion";
import { ISR_TIME, PAGINATION } from "@/lib/constants";

interface LogsPageProps {
  searchParams: { page?: string };
}

export const revalidate = ISR_TIME;

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const currentPage = parseInt(searchParams.page || "1", 10);

  const logs = await getNotionLogs();
  const pageCount = Math.ceil(logs.length / PAGINATION.logs);
  const currentLogs = logs.slice(
    (currentPage - 1) * PAGINATION.logs,
    currentPage * PAGINATION.logs,
  );

  return (
    <PaginatedLayout
      title="TIL"
      currentPage={currentPage}
      pageCount={pageCount}
      route="log"
      calendarType="log"
    >
      <div className="flex flex-col px-4 py-2">
        {currentLogs.map((log, idx) => (
          <ListItem
            key={`${currentPage}-${idx}`}
            slug={log.slug}
            title={log.title}
            date={log.date}
            index={idx}
          />
        ))}
      </div>
    </PaginatedLayout>
  );
}
