import { Card } from "@/components/Card";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionPosts } from "@/lib/notion";
import { ISR_TIME, PAGINATION } from "@/lib/constants";
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
  const currentPage = parseInt(searchParams.page ?? "1", 10);

  const posts = await getNotionPosts();
  const pageCount = Math.ceil(posts.length / PAGINATION.posts);
  const currentPosts = posts.slice(
    (currentPage - 1) * PAGINATION.posts,
    currentPage * PAGINATION.posts,
  );

  return (
    <PaginatedLayout
      title="POST"
      currentPage={currentPage}
      pageCount={pageCount}
      route="post"
      calendarType="post"
    >
      <div className="flex flex-1 flex-wrap content-start justify-center gap-6 p-4">
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
