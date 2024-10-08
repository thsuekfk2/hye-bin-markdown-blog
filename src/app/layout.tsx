import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HyeBin's",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-full bg-[#222222] text-[#F9FAFB]">
          <div className="flex h-[8%] justify-center">
            <header className="ml-2 mr-2 flex w-full max-w-[800px] items-center justify-between">
              <Analytics />
              <Link href="/">
                <div className="flex items-center gap-2">
                  <Image src="/cat.png" alt="" width={20} height={20} />
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
