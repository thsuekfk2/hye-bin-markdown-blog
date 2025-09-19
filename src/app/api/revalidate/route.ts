import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (path) {
      // 특정 경로 재검증
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path,
        message: `Path ${path} revalidated successfully`,
        timestamp: new Date().toISOString(),
      });
    }
    // 전체 사이트 재검증
    revalidatePath("/layout");
    revalidatePath("/post");
    revalidatePath("/log");

    return NextResponse.json({
      revalidated: true,
      message: "All pages revalidated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: err.message,
      },
      { status: 500 },
    );
  }
}
