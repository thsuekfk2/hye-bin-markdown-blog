import { Card } from "@/components/Card";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionPosts } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "포스트 | 이혜빈",
  description: "노션에서 직접 불러온 최신 포스트들",
};

export const revalidate = ISR_TIME;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const POSTS_PER_PAGE = 4;
  const currentPage = parseInt(searchParams.page ?? "1", 10);

  const posts = await getNotionPosts();
  const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  return (
    <PaginatedLayout
      title="POST"
      currentPage={currentPage}
      pageCount={pageCount}
      route="post"
    >
      <div className="flex flex-1 flex-wrap content-start justify-center gap-6 overflow-y-auto">
        {currentPosts.map((post, key) => (
          <Card
            key={`${currentPage}-${key}`}
            href={`post/${post.slug}`}
            thumbnail={post.thumbnail}
            description={post.description}
            title={post.title}
            index={key}
            tags={post.tags}
          />
        ))}
      </div>
    </PaginatedLayout>
  );
}
