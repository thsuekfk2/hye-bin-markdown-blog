import { ImageBlock as ImageBlockType } from "@/types/notion";
import { FallbackImage } from "@/components/FallbackImage";

interface ImageBlockProps {
  block: ImageBlockType;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const imageUrl = block.image?.external?.url || block.image?.file?.url;
  const caption = block.image?.caption?.[0]?.plain_text || "";
  const originalImageUrl = (block as any)?.originalImageUrl;

  return (
    <figure className="mb-6 flex flex-col items-center">
      {imageUrl && (
        <FallbackImage
          src={imageUrl}
          alt={caption || "Image"}
          className="h-auto w-full max-w-2xl rounded-lg"
          notionUrl={originalImageUrl}
        />
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-gray-300">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
