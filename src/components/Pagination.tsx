import Link from "next/link";

interface PaginationProps {
  route: string;
  pageCount: number;
  currentPage: number;
}

export const Pagination = ({
  route,
  pageCount,
  currentPage,
}: PaginationProps) => {
  return (
    <div className="flex min-h-[60px] items-center justify-center gap-2 px-4 sm:gap-[10px]">
      {Array.from({ length: pageCount }).map((_, i) => (
        <Link key={i} href={i === 0 ? `/${route}` : `/${route}?page=${i + 1}`}>
          <div
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-[36px] sm:w-[36px] ${
              i + 1 === currentPage
                ? "text-gray-white border-solid border-stone-50"
                : "border-2 border-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            }`}
          >
            {i + 1}
          </div>
        </Link>
      ))}
    </div>
  );
};
