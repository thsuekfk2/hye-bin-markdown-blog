import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { getNotionPosts } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";
import { compareDesc } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "포스트 | 이혜빈",
  description: "노션에서 직접 불러온 최신 포스트들",
};

// ISR 설정 - 전역 설정 사용
export const revalidate = ISR_TIME;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const POSTS_PER_PAGE = 4;
  const currentPage = parseInt(searchParams.page ?? "1", 10);

  const posts = await getNotionPosts();
  const sortedPosts = posts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  );

  const pageCount = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const currentPosts = sortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-[60px] flex-col justify-center text-center">
        포스트
      </div>
      <div className="flex flex-col sm:h-[calc(100vh-170px)]">
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-wrap content-start justify-center gap-6 overflow-y-auto">
            {currentPosts.map((post, key) => (
              <Card
                key={`${currentPage}-${key}`}
                href={`post/${post.slug}`}
                thumbnail={post.thumbnail}
                description={post.description}
                title={post.title}
                index={key}
              />
            ))}
          </div>
        </div>
        <div className="flex h-[80px] flex-shrink-0 items-center justify-center">
          <Pagination
            route="post"
            pageCount={pageCount}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
