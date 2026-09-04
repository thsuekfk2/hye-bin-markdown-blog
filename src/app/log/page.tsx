import { ListItem } from "@/components/ListItem";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionLogs } from "@/lib/notion";
import { PAGINATION } from "@/lib/constants";

export const revalidate = 3600;

export default async function LogsPage() {
  const logs = await getNotionLogs();
  const pageCount = Math.ceil(logs.length / PAGINATION.logs);
  const currentLogs = logs.slice(0, PAGINATION.logs);

  return (
    <PaginatedLayout
      title="TIL"
      currentPage={1}
      pageCount={pageCount}
      route="log"
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
