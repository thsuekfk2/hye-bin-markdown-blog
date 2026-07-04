import { Card } from "@/components/Card";
import { PaginatedLayout } from "@/components/PaginatedLayout";
import { getNotionPosts } from "@/lib/notion";
import { ISR_TIME, PAGINATION } from "@/lib/constants";
import { notFound } from "next/navigation";

interface PostsPageProps {
  params: { page: string };
}

export const revalidate = ISR_TIME;

export async function generateStaticParams() {
  const posts = await getNotionPosts();
  const pageCount = Math.ceil(posts.length / PAGINATION.posts);
  return Array.from({ length: pageCount - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function PostsPage({ params }: PostsPageProps) {
  const currentPage = parseInt(params.page, 10);
  const posts = await getNotionPosts();
  const pageCount = Math.ceil(posts.length / PAGINATION.posts);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > pageCount) {
    notFound();
  }

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
            key={key}
            href={`/post/${post.slug}`}
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
