import {
  getNotionPost,
  getNotionLogs,
  getNotionPostMetadata,
} from "@/lib/notion";
import { ArticleLayout } from "@/components/ArticleLayout";
import { generateArticleMetadata } from "@/lib/metadata";
import { ISR_TIME } from "@/lib/config";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface LogPageProps {
  params: { date: string };
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: LogPageProps): Promise<Metadata> {
  const log = await getNotionPostMetadata(params.date);

  return generateArticleMetadata({
    article: log,
    type: "log",
    slug: params.date,
    fallbackTitle: "Log Not Found",
    fallbackDescription: "이혜빈의 개발 로그",
  });
}

export const revalidate = ISR_TIME;

// generateStaticParams 추가 - ISR을 위한 정적 경로 생성
export async function generateStaticParams() {
  const logs = await getNotionLogs();
  return logs.map((log) => ({
    date: log.slug,
  }));
}

export default async function LogPage({ params }: LogPageProps) {
  const log = await getNotionPost(params.date);

  if (!log) {
    notFound();
  }

  const logs = await getNotionLogs();

  return <ArticleLayout article={log} articles={logs} type="log" />;
}
