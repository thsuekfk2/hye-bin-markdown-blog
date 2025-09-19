import { getNotionPost, getNotionLogs } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import { NotionToc } from "@/components/NotionToc";
import { getRevalidateTime } from "@/lib/config";
import { format, parseISO } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Giscus } from "@/components/Giscus";

interface LogPageProps {
  params: { date: string };
}

// 정적 경로 생성
export async function generateStaticParams() {
  const logs = await getNotionLogs();
  return logs.map((log) => ({
    date: log.slug,
  }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: LogPageProps): Promise<Metadata> {
  const log = await getNotionPost(params.date);

  if (!log) {
    return {
      title: "Log Not Found",
    };
  }

  return {
    title: log.title,
    description: log.description || "이혜빈의 개발 로그",
    openGraph: {
      title: log.title,
      description: log.description || "이혜빈의 개발 로그",
      type: "article",
      locale: "ko",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/log/${params.date}`,
      images: log.thumbnail ? [{ url: log.thumbnail }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: log.title,
      description: log.description || "이혜빈의 개발 로그",
      images: log.thumbnail ? [log.thumbnail] : [],
    },
  };
}

export const revalidate = getRevalidateTime('LOG_DETAIL');

export default async function LogPage({ params }: LogPageProps) {
  const log = await getNotionPost(params.date);

  if (!log) {
    notFound();
  }

  const logs = await getNotionLogs();
  const logIndex = logs.findIndex((l) => l.slug === params.date);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: log.title,
    description: log.description,
    datePublished: log.date,
    dateModified: log.date,
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
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/log/${params.date}`,
    image: log.thumbnail,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/log/${params.date}`,
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
      <div className="flex flex-col w-full">
        <div>
          {/* 헤더 */}
          <div className="mb-[70px] mt-[40px] text-center font-bold">
            <div className="text-[25px]">{log.title}</div>
            <div className="text-sm">
              {log.date && format(parseISO(log.date), "LLLL d, yyyy")}
            </div>
          </div>

          {/* 노션 콘텐츠 */}
          <article>
            <div className="relative">
              <NotionToc blocks={log.blocks} />
              <NotionRenderer blocks={log.blocks} />
            </div>
          </article>

          {/* 이전/다음 네비게이션 */}
          <div className="flex flex-col justify-between gap-8 my-16 md:flex-row">
            <div>
              {logs[logIndex - 1] && (
                <a href={`/log/${logs[logIndex - 1].slug}`}>
                  <p>이전 로그</p>
                  <p className="font-bold">{logs[logIndex - 1].title}</p>
                </a>
              )}
            </div>
            <div className="text-right">
              {logs[logIndex + 1] && (
                <a href={`/log/${logs[logIndex + 1].slug}`}>
                  <p>다음 로그</p>
                  <p className="font-bold">{logs[logIndex + 1].title}</p>
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
