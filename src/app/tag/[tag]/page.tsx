import { getPostsByTag, getAllTags } from "@/lib/notion";
import { Card } from "@/components/Card";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ISR_TIME } from "@/lib/config";

interface TagPageProps {
  params: { tag: string };
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);

  return {
    title: `${decodedTag} 태그 포스트 - 이혜빈의 개발블로그`,
    description: `${decodedTag} 태그가 포함된 모든 포스트를 확인해보세요.`,
    openGraph: {
      title: `${decodedTag} 태그 포스트`,
      description: `${decodedTag} 태그가 포함된 모든 포스트를 확인해보세요.`,
      type: "website",
      locale: "ko",
    },
  };
}

// ISR 설정 추가
export const revalidate = ISR_TIME;

// generateStaticParams 추가 - ISR을 위한 정적 경로 생성
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const decodedTag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-[70px] items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">#{decodedTag}</h1>
        <span className="text-sm text-gray-400">{posts.length}개의 포스트</span>
      </div>
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              href={`/post/${post.slug}`}
              thumbnail={post.thumbnail}
              description={post.description}
              title={post.title}
              index={index}
              tags={post.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
