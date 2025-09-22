import { ReactNode } from "react";
import { Pagination } from "@/components/Pagination";

interface PaginatedLayoutProps {
  title: string;
  currentPage: number;
  pageCount: number;
  route: string;
  children: ReactNode;
}

export function PaginatedLayout({
  title,
  currentPage,
  pageCount,
  route,
  children,
}: PaginatedLayoutProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col justify-between">
        <div className="flex h-[70px] flex-col justify-center text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          {children}
        </div>
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