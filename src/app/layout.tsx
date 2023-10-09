import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

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
        <div className="bg-[#222222] h-full text-[#F9FAFB]">
          <div className="flex h-[8%] justify-center">
            <header className="flex w-full max-w-[800px] ml-2 mr-2 justify-between items-center">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <Image src="/cat.png" alt="" width={20} height={20} />
                  hyebin
                </div>
              </Link>
              <div className="flex gap-6">
                <Link href="/post">Post</Link>
                <Link href="/log">Log</Link>
              </div>
            </header>
          </div>
          <main className="flex h-[92%] justify-center overflow-auto">
            <div className="flex w-full max-w-[800px] ml-2 mr-2">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
