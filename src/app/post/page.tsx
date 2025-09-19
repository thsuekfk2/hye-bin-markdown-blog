import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { getNotionPosts } from "@/lib/notion";
import { getRevalidateTime } from "@/lib/config";
import { compareDesc } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "포스트 | 이혜빈",
  description: "노션에서 직접 불러온 최신 포스트들",
};

// ISR 설정 - 전역 설정 사용
export const revalidate = getRevalidateTime('POSTS');

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
    <div className="items-center justify-center w-full h-full">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>포스트</div>
      </div>
      <div className="flex min-h-[calc(100vh-160px)] flex-col sm:h-[calc(100vh-200px)]">
        <div className="flex flex-1 flex-wrap content-start justify-center gap-6 overflow-y-auto sm:h-[calc(100%-50px)]">
          {currentPosts.map((post, key) => (
            <Card
              key={key}
              href={`post/${post.slug}`}
              thumbnail={post.thumbnail}
              description={post.description}
              title={post.title}
            />
          ))}
        </div>
        <div className="flex h-[45px] flex-shrink-0 items-center justify-center">
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
