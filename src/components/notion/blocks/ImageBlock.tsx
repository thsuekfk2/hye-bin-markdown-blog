import Image from "next/image";
import { ImageBlock as ImageBlockType } from "@/types/notion";

interface ImageBlockProps {
  block: ImageBlockType;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const imageUrl = block.image?.external?.url || block.image?.file?.url;
  const caption = block.image?.caption?.[0]?.plain_text || "";

  return (
    <figure className="mb-6 flex flex-col items-center">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={caption || "Image"}
          width={800}
          height={600}
          className="h-auto w-full max-w-2xl rounded-lg"
        />
      )}
      {caption && (
        <figcaption className="mt-2 text-xs text-center text-gray-300">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}