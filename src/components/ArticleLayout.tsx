import { NotionToc } from "@/components/NotionToc";
import { format, parseISO } from "date-fns";
import { Giscus } from "@/components/Giscus";
import { NotionPost } from "@/lib/notion";
import { NotionRenderer } from "./notion/NotionRenderer";

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
      <div className="flex w-full flex-col">
        <div>
          {/* 헤더 */}
          <ArticleHeader title={article.title} date={article.date} />

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
      </div>
    </>
  );
}

interface ArticleHeaderProps {
  title: string;
  date: string;
}

function ArticleHeader({ title, date }: ArticleHeaderProps) {
  return (
    <div className="mb-[70px] mt-[40px] text-center font-bold">
      <div className="text-[25px]">{title}</div>
      <div className="text-sm">
        {date && format(parseISO(date), "LLLL d, yyyy")}
      </div>
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
          <a href={`/${type}/${articles[currentIndex - 1].slug}`}>
            <p>이전 {type === "post" ? "포스트" : "로그"}</p>
            <p className="font-bold">{articles[currentIndex - 1].title}</p>
          </a>
        )}
      </div>
      <div className="text-right">
        {articles[currentIndex + 1] && (
          <a href={`/${type}/${articles[currentIndex + 1].slug}`}>
            <p>다음 {type === "post" ? "포스트" : "로그"}</p>
            <p className="font-bold">{articles[currentIndex + 1].title}</p>
          </a>
        )}
      </div>
    </div>
  );
}
