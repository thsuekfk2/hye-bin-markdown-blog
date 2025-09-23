import { getNotionPost, getNotionPosts } from "@/lib/notion";
import { ArticleLayout } from "@/components/ArticleLayout";
import { generateArticleMetadata } from "@/lib/metadata";
import { ISR_TIME } from "@/lib/config";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: { slug: string };
}

// 정적 경로 생성
export async function generateStaticParams() {
  const posts = await getNotionPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getNotionPost(decodedSlug);

  return generateArticleMetadata({
    article: post,
    type: "post",
    slug: params.slug,
    fallbackTitle: "Post Not Found",
    fallbackDescription: "이혜빈의 개발블로그",
  });
}

// ISR 설정 - 전역 설정 사용
export const revalidate = ISR_TIME;

export default async function PostPage({ params }: PostPageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getNotionPost(decodedSlug);

  if (!post) {
    notFound();
  }

  const posts = await getNotionPosts();

  return <ArticleLayout article={post} articles={posts} type="post" />;
}
