import { ListItem } from "@/components/ListItem";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionLogs } from "@/lib/notion";
import { ISR_TIME, PAGINATION } from "@/lib/constants";
import { notFound } from "next/navigation";

interface LogsPageProps {
  params: { page: string };
}

export const revalidate = ISR_TIME;

export async function generateStaticParams() {
  const logs = await getNotionLogs();
  const pageCount = Math.ceil(logs.length / PAGINATION.logs);
  return Array.from({ length: pageCount - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function LogsPage({ params }: LogsPageProps) {
  const currentPage = parseInt(params.page, 10);
  const logs = await getNotionLogs();
  const pageCount = Math.ceil(logs.length / PAGINATION.logs);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > pageCount) {
    notFound();
  }

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
            key={idx}
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
