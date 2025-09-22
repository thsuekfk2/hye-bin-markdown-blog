import Image from "next/image";
import Link from "next/link";
import { getRecentPosts, getRecentLogs, getAllTags } from "@/lib/notion";
import { Card } from "@/components/Card";
import { ListItem } from "@/components/ListItem";
import { TagList } from "@/components/TagList";
import { ISR_TIME } from "@/lib/config";

export const revalidate = ISR_TIME;

export default async function Home() {
  const [recentPosts, recentLogs, allTags] = await Promise.all([
    getRecentPosts(4),
    getRecentLogs(4),
    getAllTags(),
  ]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex w-full items-center justify-center text-center">
        <div className="flex flex-row">
          <h2>프론트엔드 개발자 이혜빈입니다 </h2>
          <div className="ml-4 flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Link
                target="_blank"
                href="https://github.com/thsuekfk2"
                className="flex items-center hover:text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 태그 목록 섹션 */}
      {allTags.length > 0 && (
        <TagList tags={allTags} title="태그 모음" limit={10} />
      )}

      {/* Recent Posts Section */}
      <section className="mx-5">
        <div className="max-w-6xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold">최근 포스트</h2>
            <Link
              href="/post"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {recentPosts.map((post, index) => (
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
      </section>

      {/* Recent Logs Section */}
      <section className="mx-5 min-h-[400px]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold">최근 로그</h2>
            <Link
              href="/log"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log, index) => (
              <ListItem
                key={log.id}
                slug={log.slug}
                title={log.title}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
