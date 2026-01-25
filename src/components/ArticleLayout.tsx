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
  type: "post" | "log" | "book";
}

export function ArticleLayout({ article, articles, type }: ArticleLayoutProps) {
  const articleIndex = articles.findIndex((a) => a.slug === article.slug);

  const articleUrl =
    type === "book"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/books/${encodeURIComponent(article.bookTitle || "")}/${article.slug}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/${type}/${article.slug}`;

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
      url: "https://www.hyebin.pro",
    },
    publisher: {
      "@type": "Person",
      name: "이혜빈",
      url: "https://www.hyebin.pro",
    },
    url: articleUrl,
    image: article.thumbnail,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
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
        <article className="mx-auto max-w-[750px]">
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
    <div className="relative mt-[40px] text-center">
      <FallbackImage
        src={thumbnail}
        alt={title}
        className="z-1 h-[200px] w-full object-cover opacity-20"
        notionUrl={originalThumbnail}
      />
      <div className="absolute top-0 flex h-[200px] w-full flex-col items-center justify-center font-bold">
        <div
          className="text-[25px] text-white"
          style={{ fontFamily: '"Catamaran", sans-serif' }}
        >
          {title}
        </div>
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
  type: "post" | "log" | "book";
}

function ArticleNavigation({
  articles,
  currentIndex,
  type,
}: ArticleNavigationProps) {
  const getArticleUrl = (article: NotionPost) => {
    if (type === "book") {
      return `/books/${encodeURIComponent(article.bookTitle || "")}/${article.slug}`;
    }
    return `/${type}/${article.slug}`;
  };

  const getTypeLabel = () => {
    if (type === "post") return "포스트";
    if (type === "log") return "로그";
    return "챕터";
  };

  return (
    <div className="my-16 flex flex-col justify-between gap-8 md:flex-row">
      <div>
        {articles[currentIndex - 1] && (
          <Link
            href={getArticleUrl(articles[currentIndex - 1])}
            className="block transition-opacity hover:opacity-80"
          >
            <p>이전 {getTypeLabel()}</p>
            <p className="font-bold">{articles[currentIndex - 1].title}</p>
          </Link>
        )}
      </div>
      <div className="text-right">
        {articles[currentIndex + 1] && (
          <Link
            href={getArticleUrl(articles[currentIndex + 1])}
            className="block transition-opacity hover:opacity-80"
          >
            <p>다음 {getTypeLabel()}</p>
            <p className="font-bold">{articles[currentIndex + 1].title}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
