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
    <div className="gap-[10px] flex justify-center min-h-[80px] items-center">
      {Array.from({ length: pageCount }).map((_, i) => (
        <Link key={i} href={i === 0 ? `/${route}` : `/${route}?page=${i + 1}`}>
          <div
            className={`w-[30px] h-[30px] flex items-center justify-center rounded-full font-bold ${
              i + 1 === currentPage &&
              "border-solid border-stone-50 text-gray-white"
            } hover:bg-gray-50 hover:text-gray-900 text-xs`}
          >
            {i + 1}
          </div>
        </Link>
      ))}
    </div>
  );
};
