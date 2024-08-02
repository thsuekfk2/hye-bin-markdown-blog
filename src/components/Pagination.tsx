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
    <div className="flex min-h-[80px] items-center justify-center gap-[10px]">
      {Array.from({ length: pageCount }).map((_, i) => (
        <Link key={i} href={i === 0 ? `/${route}` : `/${route}?page=${i + 1}`}>
          <div
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-full font-bold ${
              i + 1 === currentPage &&
              "text-gray-white border-solid border-stone-50"
            } text-xs hover:bg-gray-50 hover:text-gray-900`}
          >
            {i + 1}
          </div>
        </Link>
      ))}
    </div>
  );
};
