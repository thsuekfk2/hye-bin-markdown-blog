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

export default async function PostsPage() {
  const posts = await getNotionPosts();
  const pageCount = Math.ceil(posts.length / PAGINATION.posts);
  const currentPosts = posts.slice(0, PAGINATION.posts);

  return (
    <PaginatedLayout
      title="POST"
      currentPage={1}
      pageCount={pageCount}
      route="post"
    >
      <div className="flex flex-1 flex-wrap content-start justify-center gap-6 p-4">
        {currentPosts.map((post, key) => (
          <Card
            key={key}
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
