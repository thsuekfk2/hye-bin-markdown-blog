import {
  getNotionPost,
  getNotionPosts,
  getNotionPostMetadata,
} from "@/lib/notion";
import { ArticleLayout } from "@/components/ArticleLayout";
import { generateArticleMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getNotionPostMetadata(decodedSlug);

  return generateArticleMetadata({
    article: post,
    type: "post",
    slug,
    fallbackTitle: "Post Not Found",
    fallbackDescription: "이혜빈의 개발블로그",
  });
}

// ISR 설정 - 전역 설정 사용
export const revalidate = 3600;

// generateStaticParams 추가 - ISR을 위한 정적 경로 생성
export async function generateStaticParams() {
  const posts = await getNotionPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getNotionPost(decodedSlug);

  if (!post) {
    notFound();
  }

  const posts = await getNotionPosts();

  return <ArticleLayout article={post} articles={posts} type="post" />;
}
