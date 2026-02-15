"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { IMAGE } from "@/lib/constants";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  notionUrl?: string;
  width?: number;
  height?: number;
  onRatioCalculated?: (ratio: number) => void;
}

interface UploadResponse {
  uploadedUrl: string;
}

export function FallbackImage({
  src,
  alt,
  className,
  notionUrl,
  width = 800,
  height = 300,
  onRatioCalculated,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUploading, setIsUploading] = useState(false);

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
        return result.uploadedUrl && result.uploadedUrl !== IMAGE.fallback
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
    if (notionUrl && !isUploading) {
      setIsUploading(true);

      const uploadedUrl = await uploadImage(notionUrl, currentSrc);
      setIsUploading(false);
      if (uploadedUrl) {
        setCurrentSrc(uploadedUrl);
        return;
      }
    }

    setCurrentSrc(IMAGE.fallback);
  }, [currentSrc, notionUrl, uploadImage, isUploading]);

  return (
    <Image
      src={isUploading ? IMAGE.fallback : currentSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      width={width}
      height={height}
      onLoad={(e) => {
        setIsUploading(false);
        if (onRatioCalculated) {
          const img = e.currentTarget as HTMLImageElement;
          onRatioCalculated(img.naturalWidth / img.naturalHeight);
        }
      }}
    />
  );
}
