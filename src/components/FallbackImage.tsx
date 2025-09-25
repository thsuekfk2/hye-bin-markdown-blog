"use client";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  originalUrl?: string; // 원본 Notion URL
}

export function FallbackImage({ src, alt, className, originalUrl }: FallbackImageProps) {
  const handleError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const failedSrc = target.src;
    
    // S3 URL이 실패하고 원본 URL이 있으면 업로드 시도
    if (failedSrc.includes('.s3.') && failedSrc.includes('amazonaws.com') && originalUrl) {
      try {
        console.log('S3 image not found, attempting upload:', failedSrc);
        
        // S3에 업로드 요청
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            notionUrl: originalUrl,
            s3Url: failedSrc
          })
        });
        
        if (response.ok) {
          // 업로드 성공하면 다시 시도
          target.src = failedSrc;
          return;
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
    
    // 최종 fallback
    target.src = "/jump.webp";
  };

  return (
    <img src={src} alt={alt} className={className} onError={handleError} />
  );
}
