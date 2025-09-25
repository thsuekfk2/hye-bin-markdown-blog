"use client";

import Image from "next/image";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  notionUrl?: string; // 원본 Notion URL
}

export function FallbackImage({
  src,
  alt,
  className,
  notionUrl,
}: FallbackImageProps) {
  const checkImageValidity = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const validateAndUpload = async () => {
    console.log("Checking image validity:", src);

    const isValid = await checkImageValidity(src);
    console.log("Image validity result:", isValid);

    if (!isValid) {
      console.log("Image is invalid, checking upload conditions");

      // S3 URL이고 원본 URL이 있으며, 아직 업로드를 시도하지 않은 경우
      if (src.includes(".s3.") && src.includes("amazonaws.com") && notionUrl) {
        console.log("Attempting upload with notionUrl:", notionUrl);

        try {
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              notionUrl,
              s3Url: src.split("?")[0],
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Upload result:", result);

            if (result.uploadedUrl && result.uploadedUrl !== "/jump.webp") {
              console.log("Setting new image URL:", result.uploadedUrl);
              return result.uploadedUrl;
            }
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
        }
      }
      console.log("Using fallback image");
      return "/jump.webp";
    } else {
      console.log("Image is valid, using original src");
      return src;
    }
  };

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => validateAndUpload()}
      width={800}
      height={300}
    />
  );
}
