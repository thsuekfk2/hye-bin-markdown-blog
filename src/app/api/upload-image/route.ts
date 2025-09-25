import { NextRequest, NextResponse } from "next/server";
import { uploadNotionImageToS3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const { notionUrl, s3Url } = await request.json();

    if (!notionUrl) {
      return NextResponse.json({ error: "Missing notionUrl" }, { status: 400 });
    }

    console.log(`Uploading missing image: ${notionUrl} -> ${s3Url}`);

    // S3에 업로드
    const uploadedUrl = await uploadNotionImageToS3(notionUrl);
    
    return NextResponse.json({ 
      success: true, 
      uploadedUrl,
      message: "Image uploaded successfully" 
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" }, 
      { status: 500 }
    );
  }
}