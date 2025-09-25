import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("URL parameter is required", { status: 400 });
    }

    // Notion 이미지 URL인지 확인
    if (
      !imageUrl.includes("amazonaws.com") &&
      !imageUrl.includes("notion.so")
    ) {
      return new NextResponse("Invalid image URL", { status: 400 });
    }

    // 이미지 가져오기
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=31536000", // 1일 브라우저, 1년 CDN
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
