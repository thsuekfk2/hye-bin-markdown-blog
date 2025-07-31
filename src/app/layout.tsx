import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "이혜빈 | 프론트엔드 개발자",
  description: "프론트엔드 개발자 이혜빈의 기술 블로그입니다. ",
  keywords: [
    "프론트엔드",
    "개발자",
    "React",
    "Next.js",
    "TypeScript",
    "이혜빈",
  ],
  authors: [{ name: "이혜빈" }],
  openGraph: {
    title: "이혜빈 | 프론트엔드 개발자",
    description: "프론트엔드 개발자의 기술 블로그",
    url: "https://www.hyebin.me",
    siteName: "HyeBin's Blog",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="h-full bg-[#222222] text-[#F9FAFB]">
          <div className="flex h-[8%] justify-center">
            <header className="ml-2 mr-2 flex w-full max-w-[800px] items-center justify-between">
              <Analytics />
              <Link href="/">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://hyebin-markdown-blog.s3.ap-northeast-2.amazonaws.com/cat.png"
                    alt="고양이"
                    width={20}
                    height={20}
                  />
                  <span className="transition-all delay-75 hover:underline">
                    hyebin
                  </span>
                </div>
              </Link>
              <div className="flex gap-6 text-sm">
                <Link
                  href="/post"
                  className="flex w-[50px] justify-center transition-all delay-75 hover:rounded-full hover:bg-[#444]"
                >
                  Post
                </Link>
                <Link
                  href="/log"
                  className="flex w-[50px] justify-center transition-all delay-75 hover:rounded-full hover:bg-[#444]"
                >
                  TIL
                </Link>
              </div>
            </header>
          </div>
          <main className="flex h-[92%] justify-center overflow-auto">
            <div className="flex w-full max-w-[800px]">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
