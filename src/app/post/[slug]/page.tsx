import { getNotionPost, getNotionPosts } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import { NotionToc } from "@/components/NotionToc";
import { getRevalidateTime } from "@/lib/config";
import { format, parseISO } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Giscus } from "@/components/Giscus";

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

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description || "이혜빈의 개발블로그",
    openGraph: {
      title: post.title,
      description: post.description || "이혜빈의 개발블로그",
      type: "article",
      locale: "ko",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${params.slug}`,
      images: post.thumbnail ? [{ url: post.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || "이혜빈의 개발블로그",
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

// ISR 설정 - 전역 설정 사용
export const revalidate = getRevalidateTime("POST_DETAIL");

export default async function PostPage({ params }: PostPageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getNotionPost(decodedSlug);

  if (!post) {
    notFound();
  }

  const posts = await getNotionPosts();
  const postIndex = posts.findIndex((p) => p.slug === decodedSlug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "이혜빈",
      url: "https://www.hyebin.me",
    },
    publisher: {
      "@type": "Person",
      name: "이혜빈",
      url: "https://www.hyebin.me",
    },
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${params.slug}`,
    image: post.thumbnail,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/post/${params.slug}`,
    },
    inLanguage: "ko",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="flex flex-col w-full ml-3 mr-3">
        <div>
          {/* 헤더 */}
          <div className="mb-[50px] mt-[40px] text-center font-bold">
            <div className="text-[25px]">{post.title}</div>
            <div className="text-sm">
              {post.date && format(parseISO(post.date), "LLLL d, yyyy")}
            </div>
          </div>

          {/* 노션 콘텐츠 */}
          <article>
            <div className="relative">
              <NotionToc blocks={post.blocks} />
              <NotionRenderer blocks={post.blocks} />
            </div>
          </article>

          {/* 이전/다음 네비게이션 */}
          <div className="flex flex-col justify-between gap-8 my-16 md:flex-row">
            <div>
              {posts[postIndex - 1] && (
                <a href={`/post/${posts[postIndex - 1].slug}`}>
                  <p>이전 포스트</p>
                  <p className="font-bold">{posts[postIndex - 1].title}</p>
                </a>
              )}
            </div>
            <div className="text-right">
              {posts[postIndex + 1] && (
                <a href={`/post/${posts[postIndex + 1].slug}`}>
                  <p>다음 포스트</p>
                  <p className="font-bold">{posts[postIndex + 1].title}</p>
                </a>
              )}
            </div>
          </div>
          <Giscus />
        </div>
      </div>
    </>
  );
}
