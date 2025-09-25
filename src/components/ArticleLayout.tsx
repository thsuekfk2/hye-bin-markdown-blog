import { NotionToc } from "@/components/NotionToc";
import { format, parseISO } from "date-fns";
import { Giscus } from "@/components/Giscus";
import { NotionPost } from "@/lib/notion";
import { NotionRenderer } from "./notion/NotionRenderer";
import { TagGroup } from "./TagGroup";
import { FallbackImage } from "./FallbackImage";
import Link from "next/link";

interface ArticleLayoutProps {
  article: NotionPost;
  articles: NotionPost[];
  type: "post" | "log";
}

export function ArticleLayout({ article, articles, type }: ArticleLayoutProps) {
  const articleIndex = articles.findIndex((a) => a.slug === article.slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
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
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${type}/${article.slug}`,
    image: article.thumbnail,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/${type}/${article.slug}`,
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

      <div className="ml-3 mr-3 flex w-full flex-col">
        {/* 헤더 */}
        <ArticleHeader
          thumbnail={article.thumbnail || "/jump.webp"}
          title={article.title}
          date={article.date}
          tags={article.tags}
          originalThumbnail={article.originalThumbnail}
        />

        {/* 노션 콘텐츠 */}
        <article>
          <div className="relative">
            <NotionToc blocks={article.blocks || []} />
            <NotionRenderer blocks={article.blocks || []} />
          </div>
        </article>

        {/* 이전/다음 네비게이션 */}
        <ArticleNavigation
          articles={articles}
          currentIndex={articleIndex}
          type={type}
        />

        <Giscus />
      </div>
    </>
  );
}

interface ArticleHeaderProps {
  title: string;
  date: string;
  tags?: string[];
  thumbnail: string;
  originalThumbnail?: string;
}

function ArticleHeader({
  title,
  date,
  tags,
  thumbnail,
  originalThumbnail,
}: ArticleHeaderProps) {
  return (
    <div className="relative mt-[40px] text-center font-bold">
      <FallbackImage
        src={thumbnail}
        alt={title}
        className="z-1 h-[200px] w-full object-cover opacity-20"
        originalUrl={originalThumbnail}
      />
      <div className="absolute top-0 flex h-full w-full flex-col items-center justify-center">
        <div className="text-[25px]">{title}</div>
        <div className="text-sm">
          {date && format(parseISO(date), "LLLL d, yyyy")}
        </div>
      </div>

      {/* 태그 표시 */}
      {tags && tags.length > 0 && (
        <div className="mt-4">
          <TagGroup tags={tags} layout="center" size="md" />
        </div>
      )}
    </div>
  );
}

interface ArticleNavigationProps {
  articles: NotionPost[];
  currentIndex: number;
  type: "post" | "log";
}

function ArticleNavigation({
  articles,
  currentIndex,
  type,
}: ArticleNavigationProps) {
  return (
    <div className="my-16 flex flex-col justify-between gap-8 md:flex-row">
      <div>
        {articles[currentIndex - 1] && (
          <Link
            href={`/${type}/${articles[currentIndex - 1].slug}`}
            className="block transition-opacity hover:opacity-80"
          >
            <p>이전 {type === "post" ? "포스트" : "로그"}</p>
            <p className="font-bold">{articles[currentIndex - 1].title}</p>
          </Link>
        )}
      </div>
      <div className="text-right">
        {articles[currentIndex + 1] && (
          <Link
            href={`/${type}/${articles[currentIndex + 1].slug}`}
            className="block transition-opacity hover:opacity-80"
          >
            <p>다음 {type === "post" ? "포스트" : "로그"}</p>
            <p className="font-bold">{articles[currentIndex + 1].title}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
