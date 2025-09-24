import { NextResponse } from "next/server";
import { getNotionPosts, getNotionLogs } from "@/lib/notion";
import { ISR_TIME } from "@/lib/config";

export const revalidate = ISR_TIME;

export async function GET() {
  try {
    const [posts, logs] = await Promise.all([
      getNotionPosts(),
      getNotionLogs(),
    ]);

    // 포스트와 로그를 합쳐서 반환
    const allArticles = [
      ...posts.map((post) => ({ ...post, type: "post" })),
      ...logs.map((log) => ({ ...log, type: "log" })),
    ];

    return NextResponse.json(allArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json([], { status: 500 });
  }
}
