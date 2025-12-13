import { ReactNode } from "react";
import { Pagination } from "@/components/Pagination";
import { Calendar } from "@/components/Calendar";

interface PaginatedLayoutProps {
  title: string;
  currentPage: number;
  pageCount: number;
  route: string;
  children: ReactNode;
  calendarType?: "post" | "log" | "all";
}

export function PaginatedLayout({
  title,
  currentPage,
  pageCount,
  route,
  children,
  calendarType = "all",
}: PaginatedLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-[70px] items-center justify-between px-7">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="r-0 relative">
          <Calendar filterType={calendarType} />
        </div>
      </div>
      <div className="flex-1">
        <div className="h-full">{children}</div>
      </div>
      <div className="flex h-[80px] flex-shrink-0 items-center justify-center">
        <Pagination
          route={route}
          pageCount={pageCount}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
