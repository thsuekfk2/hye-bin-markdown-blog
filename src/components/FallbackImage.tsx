"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  notionUrl?: string;
  width?: number;
  height?: number;
}

interface UploadResponse {
  uploadedUrl: string;
}

const FALLBACK_IMAGE = "/jump.webp";

export function FallbackImage({
  src,
  alt,
  className,
  notionUrl,
  width = 800,
  height = 300,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  const checkImageValidity = useCallback(
    async (imageUrl: string): Promise<boolean> => {
      try {
        const response = await fetch(imageUrl, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    },
    [],
  );

  const isS3Url = useCallback((url: string): boolean => {
    return url.includes(".s3.") && url.includes("amazonaws.com");
  }, []);

  const uploadImage = useCallback(
    async (notionUrl: string, s3Url: string): Promise<string | null> => {
      try {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notionUrl,
            s3Url: s3Url.split("?")[0],
          }),
        });

        if (!response.ok) return null;

        const result: UploadResponse = await response.json();
        return result.uploadedUrl && result.uploadedUrl !== FALLBACK_IMAGE
          ? result.uploadedUrl
          : null;
      } catch (error) {
        console.error("Failed to upload image:", error);
        return null;
      }
    },
    [],
  );

  const handleImageError = useCallback(async () => {
    const isValid = await checkImageValidity(currentSrc);

    if (isValid) return;

    if (isS3Url(currentSrc) && notionUrl) {
      const uploadedUrl = await uploadImage(notionUrl, currentSrc);
      if (uploadedUrl) {
        setCurrentSrc(uploadedUrl);
        return;
      }
    }

    setCurrentSrc(FALLBACK_IMAGE);
  }, [currentSrc, notionUrl, checkImageValidity, isS3Url, uploadImage]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      width={width}
      height={height}
    />
  );
}
